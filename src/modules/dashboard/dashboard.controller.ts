import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../config/constants";
import { sendResponse } from "../../utils/apiResponse";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async summary(req: Request, res: Response) {
    const result = await dashboardService.getSummary(req.user!);
    return sendResponse(res, HTTP_STATUS.OK, "Dashboard summary fetched successfully", result);
  },
};