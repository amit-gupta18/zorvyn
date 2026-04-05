import { Router } from "express";
import { Role } from "@prisma/client";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { recordController } from "./record.controller";
import { recordCreateSchema, recordIdParamSchema, recordListQuerySchema, recordUpdateSchema } from "./record.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", authorize([Role.ADMIN, Role.ANALYST, Role.VIEWER]), validate({ query: recordListQuerySchema }), asyncHandler(recordController.list));
router.get("/:id", authorize([Role.ADMIN, Role.ANALYST, Role.VIEWER]), validate({ params: recordIdParamSchema }), asyncHandler(recordController.get));
router.post("/", authorize([Role.ADMIN, Role.ANALYST]), validate({ body: recordCreateSchema }), asyncHandler(recordController.create));
router.patch("/:id", authorize([Role.ADMIN, Role.ANALYST]), validate({ params: recordIdParamSchema, body: recordUpdateSchema }), asyncHandler(recordController.update));
router.delete("/:id", authorize([Role.ADMIN, Role.ANALYST]), validate({ params: recordIdParamSchema }), asyncHandler(recordController.remove));

export default router;