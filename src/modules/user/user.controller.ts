import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../config/constants";
import { sendResponse } from "../../utils/apiResponse";
import { userService } from "./user.service";

export const userController = {
  async create(req: Request, res: Response) {
    const result = await userService.createUser(req.body);
    return sendResponse(res, HTTP_STATUS.CREATED, "User created successfully", result);
  },

  async list(req: Request, res: Response) {
    const result = await userService.listUsers(req.query);
    return sendResponse(res, HTTP_STATUS.OK, "Users fetched successfully", result.items, result.meta);
  },

  async get(req: Request, res: Response) {
    const result = await userService.getUser(String(req.params.id));
    return sendResponse(res, HTTP_STATUS.OK, "User fetched successfully", result);
  },

  async update(req: Request, res: Response) {
    const result = await userService.updateUser(String(req.params.id), req.body);
    return sendResponse(res, HTTP_STATUS.OK, "User updated successfully", result);
  },

  async remove(req: Request, res: Response) {
    const result = await userService.deleteUser(String(req.params.id));
    return sendResponse(res, HTTP_STATUS.OK, "User deleted successfully", result);
  },
};