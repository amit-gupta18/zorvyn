import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role, Status } from "@prisma/client";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  status: string;
};

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as Role,
      status: payload.status as Status,
    };

    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}