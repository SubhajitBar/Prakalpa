import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Guides } from "../models/Guides.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { Guidesdata } from "../models/GuidesData.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Stats } from "../models/Stats.js";


// GuidesData
export const addVerifiedGuide = catchAsyncError(async(req,res,next)=>{
    const {employeeId,employeeEmail} = req.body;
    if(!employeeId || !employeeEmail ){
        return next(new ErrorHandler("Please add all filds", 400))
    };

    let employee = await Guidesdata.findOne({employeeId, employeeEmail});
    const dupId = await Guidesdata.findOne({employeeId});
    const dupEmail = await Guidesdata.findOne({employeeEmail});

    if (employee)return next(new ErrorHandler("Employee Already Exists", 409));
    if(dupId) return next(new ErrorHandler("Employee Id Already Exists", 409))
    if(dupEmail) return next(new ErrorHandler("Employee Email Already Exists", 409))

    employee = await Guidesdata.create({
        employeeId,
        employeeEmail
    })


    res.status(200).json({
        success: true,
        message: "Employee Added Successfully",
        employee,
    })
})
export const removeVerifiedGuide = catchAsyncError(async(req,res,next)=>{

    const employee = await Guidesdata.findById(req.params.id)
    if (!employee) {
        return next(new ErrorHandler("Employee not found", 404));
    };

    await Guidesdata.deleteOne()

    res.status(200).json({
        success: true,
        message: "Employee Removed Successfully",
        employee,
    })
})
export const getAllVerifiedGuide = catchAsyncError(async(req,res,next)=>{
    const employee = await Guidesdata.find({});
    if (!employee) return next(new ErrorHandler("Data not found ", 404));

    res.status(200).json({
        success: true,
        message: `${employee.length} Record Found`,
        employee,
    });
})




// Guides 
export const guideRegister = catchAsyncError(async (req, res, next) => {


    const { name, email, password, employeeId  } = req.body;
    const file = req.file;

    if (!name || !email || !password || !employeeId || !file) {
        return next(new ErrorHandler("Please add all filds", 400))
    };

    let user = await Guides.findOne({ email });
    let Id = await Guides.findOne({ employeeId });
    if (user ) {
        return next(new ErrorHandler("User Already Exists", 409))
    };
    if(Id){
        return next(new ErrorHandler("Employee Id Already Exists", 409));
    };
    const employeeEmail = email;
    let verifiedGuide = await Guidesdata.findOne({employeeId, employeeEmail});
    if (!verifiedGuide)return next(new ErrorHandler("You're not a verified guide please contact with Admin",401))
    

    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);


    user = await Guides.create({
        name,
        email,
        employeeId,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        },
    });

    sendToken(res, user, "Registered Successfully", 201);

})

export const guideLogin = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter all filds", 400));
    };

    const user = await Guides.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Incorrect email or password", 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("Incorrect email or password", 401));

    sendToken(res, user, `Welcome back, ${user.name}`, 200);

});

export const logout = catchAsyncError(async (req, res, next) => {   

    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite:"none",
    }).json({
        success: true,
        message: "Logged out successfully",
    });

});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await Guides.findById(req.user._id);

    res.status(200).json({
        success: true,
        user,
    });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
        return next(new ErrorHandler("Please enter all fileds", 400));

    const user = await Guides.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));

    user.password = newPassword;
    await user.save();


    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
    });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name } = req.body;

    const user = await Guides.findById(req.user._id);
    if (name) user.name = name;

    await user.save();


    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
    });
});

export const updateprofilepicture = catchAsyncError(async (req, res, next) => {


    const file = req.file;
    if (!file) return next(new ErrorHandler("Please add all filds", 400));

    const user = await Guides.findById(req.user._id);

    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Picture Updated Successfully",
    });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {

    const { email } = req.body;
    const user = await Guides.findOne({ email });

    if (!user) return next(new ErrorHandler("User Not Found", 400));

    const resetToken = user.getResetToken();
    // send token via email

    await user.save();

    const url = `${process.env.FRONTEND_URL}/guide/resetpassword/${resetToken}`;
    const message = `Click on the link to reset your password: ${url}. If you have not request then please ignore.`;

    await sendEmail(user.email, "Prakalpa Reset Password", message);


    res.status(200).json({
        success: true,
        message: `Reset Token has been sent to ${user.email}`,
    });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {

    const { token } = req.params;

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Guides.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    });

    if (!user) return next(new ErrorHandler("Token is invalid or has been expired", 401));

    user.password = req.body.password;
    user.resetPasswordExpire = undefined,
        user.resetPasswordToken = undefined,
        await user.save()

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",

    });
});

export const getEnrolledProjectUser = catchAsyncError(async(req,res,next)=>{
    const guide = await Guides.findById(req.user._id);
    const assignedId = guide.assignedProjectId;
    const project = await Course.findById(assignedId);
    if(!project)return next(new ErrorHandler("Project Not Found !",404));
    
    const enrolledUsers = await User.find({"enrolledProjectId":assignedId});

    res.status(200).json({
        success: true,
        message: `${enrolledUsers.length} Enrolled User Found`,
        project,
        enrolledUsers,
    });

});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {

    const user = await Guides.findById(req.user._id);
    const course = await Course.findById(req.body.id);

    if (!course) return next(new ErrorHandler("Invalid Project ID", 404))

    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) return true;
    })

    if (itemExist) return next(new ErrorHandler("Item already exist", 409))

    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    })

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to Bookmark",
    });

});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
    const user = await Guides.findById(req.user._id);
    const course = await Course.findById(req.query.id);
    // if (!course) return next(new ErrorHandler("Invalid Course ID", 404))

    const newPlaylist = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString()) return item;
    });

    user.playlist = newPlaylist;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Bookmark Removed",
    });

});



// Admin

export const assignGuide = catchAsyncError(async(req,res,next)=>{

    const {projectId , guideId} = req.query;

    const course = await Course.findById(projectId);
    const guide = await Guides.findById(guideId);
    if (!course) return next(new ErrorHandler("Project not found", 404));
    if (!guide) return next(new ErrorHandler("Guide not found", 404));

    if(guide.assignmentStatus === "active"  && guide.assignedProjectId !== undefined) return next(new ErrorHandler("Guide is Already Assigned"))

    if(course.guide !== undefined) return next(new ErrorHandler("Project already has a Guide",409));

    const itemExist = guide.assignedProject.find((item) => {
        if (item.course.toString() === course._id.toString()) return true;
    })
    if (itemExist) return next(new ErrorHandler("Guide is already assigned to this project", 409))

    guide.assignedProject.push({
        course: course._id,
        poster: course.poster.url
    })
    
    guide.assignmentStatus = "active";
    guide.assignedProjectId = course.id;
    course.guide = guide.name;  
    course.guideAvatar.url = guide.avatar.url;

    await guide.save();
    await course.save();

    res.status(200).json({
        success: true,
        message: "Guide is Successfully Assigned",    
    })
});

export const unassignGuide = catchAsyncError(async(req,res,next)=>{
    const {projectId , guideId} = req.query;

    const course = await Course.findById(projectId);
    const guide = await Guides.findById(guideId);
    if (!course) return next(new ErrorHandler("Project not found", 404));
    if (!guide) return next(new ErrorHandler("Guide not found", 404));

    if(guide.assignmentStatus !== "active"  && guide.assignedProjectId === undefined) return next(new ErrorHandler("Guide is already unassigned"));

    if(guide.assignedProjectId !== course.id) return next(new ErrorHandler("Guide unmatched"));

    const newAssignedProject = guide.assignedProject.filter((item) => {
        if (item.course.toString() !== course._id.toString()) return item;
    });
    guide.assignedProject = newAssignedProject ; 
    guide.assignmentStatus = undefined;
    guide.assignedProjectId = undefined;
    course.guide = undefined; 
    course.guideAvatar.url = undefined;

    await guide.save();
    await course.save();


    res.status(200).json({
        success: true,
        message: "Guide is Successfully Removed from Project",
    });

});


export const getAllGuide = catchAsyncError(async(req,res,next)=>{
    const user = await Guides.find({});
    res.status(200).json({
        success: true,
        message: `${user.length} record found`,
        user
    })
}) 

export const updateUserRole = catchAsyncError(async (req, res, next) => {
    const user = await Guides.findById(req.params.id);
    if (!user) return next(new ErrorHandler("Guide not found", 404));


    if (user.role === "guide") user.role = "admin";
    else user.role = "guide"

    await user.save();
    res.status(200).json({
        success: true,
        message: `Role Updated as : ${user.role} `,

    });

});

export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await Guides.findById(req.params.id);
    if (!user) return next(new ErrorHandler("Guide not found", 404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: `User Deleted Successfully `,
    });

});


Guides.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    // const subscription = await User.find({"enrollmentStatus":"active"});

    // stats[0].users = await User.countDocuments();

    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();

});