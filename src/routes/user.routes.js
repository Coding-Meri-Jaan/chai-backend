import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields(
        [
        //accepting two files , one is avatar and the other is cover image
            {
                name: "avatar",
                maxCount:1
            },
            {
                name: "coverImage",
                maxCount:1
            }
        ]
    ),
    registerUser);
export default router;