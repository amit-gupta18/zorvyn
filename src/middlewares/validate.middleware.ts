import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiError";

type ValidateSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const [target, schema] of Object.entries(schemas) as Array<[keyof ValidateSchemas, ZodTypeAny]>) {
      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[target]);

      if (!result.success) {
        return next(new ApiError(400, result.error.issues[0]?.message || "Validation failed", result.error.flatten()));
      }

      req[target] = result.data;
    }

    return next();
  };
}