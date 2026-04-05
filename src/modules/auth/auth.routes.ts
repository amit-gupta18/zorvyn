import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { rateLimit } from "../../middlewares/rateLimit.middleware";
import { authController } from "./auth.controller";
import { authLoginSchema, authRegisterSchema } from "./auth.validator";

const router = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many authentication attempts",
});

router.post("/register", authLimiter, validate({ body: authRegisterSchema }), asyncHandler(authController.register));
router.post("/login", authLimiter, validate({ body: authLoginSchema }), asyncHandler(authController.login));
router.get("/me", authMiddleware, asyncHandler(authController.me));

export default router;