import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    //accepting two files , one is avatar and the other is cover image
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//secured routes
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//secured routes will be there
router.route("/logout").post(verifyJWT, logoutUser);
export default router;
