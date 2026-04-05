import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../config/constants";
import { sendResponse } from "../../utils/apiResponse";
import { recordService } from "./record.service";

export const recordController = {
  async create(req: Request, res: Response) {
    const result = await recordService.createRecord(req.body);
    return sendResponse(res, HTTP_STATUS.CREATED, "Record created successfully", result);
  },

  async list(req: Request, res: Response) {
    const result = await recordService.listRecords(req.query);
    return sendResponse(res, HTTP_STATUS.OK, "Records fetched successfully", result.items, result.meta);
  },

  async get(req: Request, res: Response) {
    const result = await recordService.getRecord(String(req.params.id), req.user!);
    return sendResponse(res, HTTP_STATUS.OK, "Record fetched successfully", result);
  },

  async update(req: Request, res: Response) {
    const result = await recordService.updateRecord(String(req.params.id), req.user!, req.body);
    return sendResponse(res, HTTP_STATUS.OK, "Record updated successfully", result);
  },

  async remove(req: Request, res: Response) {
    const result = await recordService.deleteRecord(String(req.params.id), req.user!);
    return sendResponse(res, HTTP_STATUS.OK, "Record deleted successfully", result);
  },
};