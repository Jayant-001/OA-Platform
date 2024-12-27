import { Router } from "express";
import userAuthController from "../controllers/userAuthController";

const router = Router();
const authController = new userAuthController();

router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));

export default router;
