import { Router } from "express";
import { 
    registerLoginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    deleteUserByEmail, 
    verifyOTP, 
    resendOTP,
    generateNewPassword,
    verifyAccessToken
 } from "../Controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/registerLogin").post(registerLoginUser);
router.route("/verifyOTP").post(verifyOTP);
router.route("/resendOTP").post(resendOTP);
router.route("/generateNewPassword").post(generateNewPassword);
router.route("/refreshAccessToken").post(refreshAccessToken);

// secured routs
router.route("/verifyAccessToken").post(verifyJWT, verifyAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/deleteUser").post(verifyJWT, deleteUserByEmail);

export default router;