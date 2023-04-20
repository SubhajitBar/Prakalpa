import express from "express";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import { cancelEnrollment, createEnrollment, deleteEnrollmentIds, enrollMe, enrollmentVerification, getAllEnrolledStudents, getAllEnrollmentIds } from "../controllers/enrollmentController.js";


const router  = express.Router();

// enrollment verify
router.route("/enrollmentverification").post(isAuthenticated, enrollmentVerification);
router.route("/enrollme/:id").get(isAuthenticated, enrollMe);


// admin routes
// add authentic ids to the DB 
router.route("/admin/createenrollment").post(isAuthenticated, authorizeAdmin ,createEnrollment);
// get all authentic ids present in DB
router.route("/admin/getallenrollmentids").get(isAuthenticated,authorizeAdmin, getAllEnrollmentIds);
// remove ids from DB
router.route("/admin/deleteenrollment/:id").delete(isAuthenticated, authorizeAdmin,deleteEnrollmentIds );


// cancel user enrollment 
router.route("/admin/canceluserenrollment/:id").post(isAuthenticated, authorizeAdmin , cancelEnrollment );
// get all enrolled user
router.route("/admin/getallenrolledstudents").get(isAuthenticated, authorizeAdmin , getAllEnrolledStudents );

export default router;