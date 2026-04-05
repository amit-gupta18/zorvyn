import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../config/constants";
import { sendResponse } from "../../utils/apiResponse";
import { authService } from "./auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    return sendResponse(res, HTTP_STATUS.CREATED, "User registered successfully", result);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return sendResponse(res, HTTP_STATUS.OK, "Login successful", result);
  },

  async me(req: Request, res: Response) {
    const result = await authService.me(req.user!.id);
    return sendResponse(res, HTTP_STATUS.OK, "Current user fetched successfully", result);
  },
};