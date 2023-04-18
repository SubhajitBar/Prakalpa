import express, { Router } from "express"
import { addLecture, createProjects, deleteLecture, deleteProject, getAllProjects, getProjectLecture } from "../controllers/projectController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticated, authorizeSubscribers, authorizeStudent } from "../middlewares/auth.js";


const router = express.Router();

// Get All courses without lectures
router.route("/projects").get(getAllProjects);

// create new course - only admin
router.route("/createproject").post(isAuthenticated, authorizeAdmin, singleUpload, createProjects);

// Add lecture, Delete Course, Get Course Details
router.route("/project/:id").get(isAuthenticated, authorizeStudent, getProjectLecture).post(isAuthenticated, authorizeAdmin, singleUpload, addLecture).delete(isAuthenticated, authorizeAdmin, deleteProject);

// Delete Lecture
router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);

export default router;