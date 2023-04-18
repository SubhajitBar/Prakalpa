import express, { Router } from "express"
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateUserRole, updateprofilepicture } from "../controllers/userController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// sign up 
router.route("/register").post(singleUpload ,register);
// login 
router.route("/login").post(login);
// logout
router.route("/logout").get(logout);
// get profile 
router.route("/me").get(isAuthenticated, getMyProfile);
// delete my profile
router.route("/me").delete(isAuthenticated, deleteMyProfile);
// change password 
router.route("/changepassword").put(isAuthenticated, changePassword);

// update profile 
router.route("/updateprofile").put(isAuthenticated, updateProfile);

// update profile picture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateprofilepicture);

// forget password
router.route("/forgetpassword").post(forgetPassword);
// reset password
router.route("/resetpassword/:token").put(resetPassword);

// add to playlist
router.route("/addtoplaylist").post( isAuthenticated, addToPlaylist);
// remove from playlist
router.route("/removefromplaylist").delete( isAuthenticated, removeFromPlaylist);



// Admin Routes 

// get all users
router.route("/admin/users").get(isAuthenticated, authorizeAdmin,getAllUsers);

// update user role && delete user
router.route("/admin/user/:id").put(isAuthenticated, authorizeAdmin, updateUserRole).delete(isAuthenticated, authorizeAdmin, deleteUser);



export default router;