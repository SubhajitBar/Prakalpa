import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { Stats } from "../models/Stats.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

export const getAllProjects = catchAsyncError(async (req, res, next) => {

    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const courses = await Course.find({
        title: {
            $regex: keyword,
            $options: "i",
        },
        category: {
            $regex: category,
            $options: "i",
        },
    }).select("-lectures");
    res.status(200).json({
        success: true,
        data: `${courses.length} Record found`,
        courses,
    });
});


export const createProjects = catchAsyncError(async (req, res, next) => {

    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
        return next(new ErrorHandler("Please add all filds", 400));
    }

    const file = req.file;

    const fileUri = getDataUri(file);
    const mycloud = cloudinary.v2.uploader.upload(fileUri.content);



    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: (await mycloud).public_id,
            url: (await mycloud).secure_url,
        },

    })

    res.status(201).json({
        success: true,
        message: "Project Created Successfully",
    });
});

export const getProjectLecture = catchAsyncError(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course) return next(new ErrorHandler("Project not found", 404));

    course.views += 1;

    await course.save();

    res.status(200).json({
        success: true,
        lectures: course.lectures,
    });


});


// Max video size 100mb
export const addLecture = catchAsyncError(async (req, res, next) => {

    const { title, description } = req.body;
    if (!title || !description) return next(new ErrorHandler("Please enter all filds", 400));

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Project not found", 404));

    const file = req.file;
    const fileUri = getDataUri(file);

    const mycloud = cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video",
    });


    course.lectures.push({
        title,
        description,
        video: {
            public_id: (await mycloud).public_id,
            url: (await mycloud).url,
        },
    });

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture added to the Project Successfuly",
    });

});

export const deleteProject = catchAsyncError(async (req, res, next) => {

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Project not found", 404));

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i];
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
            resource_type: "video",
        });
    }

    await course.deleteOne();
    res.status(200).json({
        success: true,
        message: "Project Deleted Successfully",
    });

});


export const deleteLecture = catchAsyncError(async (req, res, next) => {

    const { projectId, lectureId } = req.query;

    const course = await Course.findById(projectId);
    if (!course) return next(new ErrorHandler("Project not found", 404));

    const lecture = course.lectures.find((item) => {
        if (item._id.toString() === lectureId.toString()) return item;
    });

    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
        resource_type: "video",
    })

    course.lectures = course.lectures.filter((item) => {
        if (item._id.toString() !== lectureId.toString()) return item;
    })

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture Deleted Successfully",
    });

});


Course.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    const courses = await Course.find({});

    let totalViews = 0;

    for (let i = 0; i < courses.length; i++) {
        totalViews += courses[i].views;
    }
    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
})