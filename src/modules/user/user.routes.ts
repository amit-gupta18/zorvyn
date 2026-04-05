import { Router } from "express";
import { Role } from "@prisma/client";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { userController } from "./user.controller";
import { userCreateSchema, userIdParamSchema, userListQuerySchema, userUpdateSchema } from "./user.validator";

const router = Router();

router.use(authMiddleware, authorize([Role.ADMIN]));

router.get("/", validate({ query: userListQuerySchema }), asyncHandler(userController.list));
router.post("/", validate({ body: userCreateSchema }), asyncHandler(userController.create));
router.get("/:id", validate({ params: userIdParamSchema }), asyncHandler(userController.get));
router.patch("/:id", validate({ params: userIdParamSchema, body: userUpdateSchema }), asyncHandler(userController.update));
router.delete("/:id", validate({ params: userIdParamSchema }), asyncHandler(userController.remove));

export default router;