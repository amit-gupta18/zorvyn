import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function clearRateLimitStore() {
  store.clear();
}

export function rateLimit(options: RateLimitOptions) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.baseUrl || ""}:${req.path}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (entry.count >= options.max) {
      return next(new ApiError(429, options.message ?? "Too many requests"));
    }

    entry.count += 1;
    store.set(key, entry);

    return next();
  };
}