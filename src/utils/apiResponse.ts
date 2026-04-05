import type { Response } from "express";

type ResponsePayload<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: Record<string, unknown>
) {
  const payload: ResponsePayload<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };

  return res.status(statusCode).json(payload);
}