import { Router } from "express";
import { login, logout, signup, updateDetails, updatePassword } from "../controllers/auth.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyUser } from "../middlewares/auth.middleware";
const router = Router();

router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);
router.post("/logout", verifyUser, logout);
router.patch("/update-password", verifyUser, updatePassword);
router.patch("/update-profile", verifyUser, upload.single("avatar"), updateDetails);

export default router;
