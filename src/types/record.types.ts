import type { RecordType } from "@prisma/client";

export type CreateRecordInput = {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  note?: string | null;
  userId: string;
};

export type UpdateRecordInput = Partial<CreateRecordInput>;