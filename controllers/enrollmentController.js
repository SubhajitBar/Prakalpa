import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { Enrollment } from "../models/Enrollment.js";
import {Course} from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";


export const createEnrollment = catchAsyncError(async (req, res, next) => {
    const { regId } = req.body;
    if (!regId) {
        return next(new ErrorHandler("Please add all filds", 400))
    };
    let uIds = await Enrollment.findOne({ regId });
    if (uIds) {
        return next(new ErrorHandler("ID already exists", 409))
    };

    uIds = await Enrollment.create({
        regId,
    })


    res.status(200).json({
        success: true,
        message: "University Id Added to the Database",
        uIds,
    })

});

export const getAllEnrollmentIds = catchAsyncError(async (req, res, next) => {
    const uIds = await Enrollment.find({});
    if (!uIds) return next(new ErrorHandler("Id not found ", 404));

    res.status(200).json({
        success: true,
        message: `${uIds.length} Record Found`,
        uIds,
    });

});

export const deleteEnrollmentIds = catchAsyncError(async (req, res, next) => {
    const uIds = await Enrollment.findById(req.params.id);
    if (!uIds) {
        return next(new ErrorHandler("ID not found", 404));
    };


    await uIds.deleteOne();
    res.status(200).json({
        success: true,
        message: "University Id Removed from Database",
        
    });


});




export const enrollmentVerification = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    if (user.role === "admin")
        return next(new ErrorHandler("Admin can't enroll", 400));

    const regId = await user.enrollmentId;
    const enroll = await Enrollment.findOne({ regId });
    if(!enroll) return next(new ErrorHandler("Invalid Registration Id",404));
    if( user.enrollmentStatus === "active") return next(new ErrorHandler("You have already enrolled",400));
    else{
    const EnrollmentID = enroll.regId;
    if (regId === EnrollmentID) {
        user.enrollmentStatus = "active"
       
    }};
    await user.save();

    res.redirect(
        `${process.env.FRONTEND_URL}/enrollmentsuccess`
      );

    // res.status(200).json({
    //     success: true,
    //     message: `Your enrollment is: ${user.enrollmentStatus}`

    // });

});

export const enrollMe = catchAsyncError(async(req,res,next)=>{


    const user = await User.findById(req.user._id);

    if (user.role === "admin")
      return next(new ErrorHandler("Admin can't buy subscription", 400));
  

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Project not found", 404));

    res.status(200).json({
        success: true,
        description: course.description,
    })
    

})




export const cancelEnrollment = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    if(user.enrollmentStatus === undefined) return next(new ErrorHandler("User is Not Enrolled",400));

    if (user.enrollmentStatus === "active" ) user.enrollmentStatus = undefined ;

    await user.save();
    res.status(200).json({
        success: true,
        message: `User Enrollment Cancelled Successfully`,

    });

});

export const getAllEnrolledStudents = catchAsyncError(async (req, res, next) => {

    const user = await User.find({"enrollmentStatus":"active"});       
    
    res.status(200).json({
        success: true,
        message: `${user.length} record found`,
        user,

    });

});