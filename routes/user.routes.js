import {Router} from "express";
import { registerUser,loginUser,logoutUser,refershAccessToken,changeCurrentPassword,getCurrentUser,googleLogin } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/get-profile").get(verifyJWT,getCurrentUser)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route("/refresh-token").post(refershAccessToken)
router.route("/logout").post(verifyJWT,logoutUser)
router.post("/google-login", googleLogin);

export default router;