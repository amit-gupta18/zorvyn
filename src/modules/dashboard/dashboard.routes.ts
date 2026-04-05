import { Router } from "express";
import { Role } from "@prisma/client";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/summary", authMiddleware, authorize([Role.ADMIN, Role.ANALYST, Role.VIEWER]), asyncHandler(dashboardController.summary));

export default router;