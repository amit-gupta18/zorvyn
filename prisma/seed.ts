import bcrypt from "bcrypt";
import { PrismaClient, RecordType, Role, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@zorvyn.com" },
    update: {},
    create: {
      email: "admin@zorvyn.com",
      password,
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@zorvyn.com" },
    update: {},
    create: {
      email: "analyst@zorvyn.com",
      password,
      role: Role.ANALYST,
      status: Status.ACTIVE,
    },
  });

  await prisma.record.createMany({
    data: [
      {
        amount: 12000,
        type: RecordType.INCOME,
        category: "Sales",
        date: new Date(),
        note: "Initial seed income",
        userId: admin.id,
      },
      {
        amount: 3500,
        type: RecordType.EXPENSE,
        category: "Operations",
        date: new Date(),
        note: "Initial seed expense",
        userId: analyst.id,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });