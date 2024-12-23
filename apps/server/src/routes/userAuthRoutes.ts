import { Router } from "express";
import AuthController from "../controllers/userAuthController";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));

export default router;
