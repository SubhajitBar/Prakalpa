import express from "express";
import { addToPlaylist, addVerifiedGuide, assignGuide, changePassword, deleteUser, forgetPassword, getAllGuide, getAllVerifiedGuide, getEnrolledProjectUser, getMyProfile, guideLogin, guideRegister, logout, removeFromPlaylist, removeVerifiedGuide, resetPassword, unassignGuide, updateProfile, updateUserRole, updateprofilepicture } from "../controllers/guideController.js";
import singleUpload from "../middlewares/multer.js";

import { authorizeAdmin, isAuthenticated, isGuideAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ***********GuidesData-[ADMIN]**********// 

// add guides data 
router.route("/admin/addverifiedguide").post(isAuthenticated,authorizeAdmin,addVerifiedGuide);
// get guides data 
router.route("/admin/getallverifiedguide").get(isAuthenticated,authorizeAdmin,getAllVerifiedGuide);
// remove guides data  
router.route("/admin/removeverifiedguide/:id").delete(isAuthenticated,authorizeAdmin,removeVerifiedGuide);


//*********Guides************//  
// guides register 
router.route("/guide/register").post(singleUpload,guideRegister);
// guides login 
router.route("/guide/login").post(guideLogin);
// logout
router.route("/guide/logout").get(logout);
//get my profile
router.route("/guide/me").get(isGuideAuthenticated,getMyProfile);
// change password 
router.route("/guide/changepassword").put(isGuideAuthenticated, changePassword);
// update profile 
router.route("/guide/updateprofile").put(isGuideAuthenticated, updateProfile);
// update profile picture 
router.route("/guide/updateprofilepicture").put(isGuideAuthenticated, singleUpload, updateprofilepicture);
// forget password
router.route("/guide/forgetpassword").post(forgetPassword);
// reset password
router.route("/guide/resetpassword/:token").put(resetPassword);
// get all enrolled students for a particular project 
router.route("/guide/enrolledusers").get(isGuideAuthenticated, getEnrolledProjectUser);
// add to playlist
router.route("/guide/addtoplaylist").post( isGuideAuthenticated, addToPlaylist);
// remove from playlist
router.route("/guide/removefromplaylist").delete( isGuideAuthenticated, removeFromPlaylist);



//*************Admin***********//
// Assign guide to project
router.route("/admin/assignguide").post(isAuthenticated, authorizeAdmin, assignGuide)
// Un-Assign guide from project
router.route("/admin/unassignguide").delete(isAuthenticated, authorizeAdmin, unassignGuide)
// get all guide 
router.route("/admin/getallguide").get(isAuthenticated,authorizeAdmin,getAllGuide);

// update guide role && delete guide
router.route("/admin/guide/:id").put(isAuthenticated, authorizeAdmin, updateUserRole).delete(isAuthenticated, authorizeAdmin, deleteUser);


export default router;