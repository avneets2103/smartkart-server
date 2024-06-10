import { Router } from "express";
import { registerLoginUser, logoutUser, refreshAccessToken, changeCurrentPassword, googleSign, deleteUserByEmail, verifyOTP, resendOTP } from "../Controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/registerLogin").post(registerLoginUser);
router.route("/googleAuth").post(googleSign);
router.route("/verifyOTP").post(verifyOTP);
router.route("/resendOTP").post(resendOTP);

// secured routs
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/deleteUser").post(verifyJWT, deleteUserByEmail);

export default router;