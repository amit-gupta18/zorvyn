import type { Role, Status } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        status: Status;
      };
    }
  }
}

export {};