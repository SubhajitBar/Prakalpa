import express, { Router } from "express";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import { contact, courseRequest, getDashboardStats } from "../controllers/otherController.js";

const router = express.Router();

// Contact Us
router.route("/contact").post(contact)

//Course Request 
router.route("/projectrequest").post(courseRequest)

// Get Admin Dashboard Stats
router.route("/admin/stats").get(isAuthenticated, authorizeAdmin, getDashboardStats)

export default router;