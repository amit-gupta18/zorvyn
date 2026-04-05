import type { Role, Status } from "@prisma/client";

export type PublicUser = {
  id: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: Date;
};

export type CreateUserInput = {
  email: string;
  password: string;
  role?: Role;
  status?: Status;
};

export type UpdateUserInput = Partial<{
  email: string;
  password: string;
  role: Role;
  status: Status;
}>;