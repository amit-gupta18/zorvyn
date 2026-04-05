"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt_1.default.hash("Password123!", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@zorvyn.com" },
        update: {},
        create: {
            email: "admin@zorvyn.com",
            password,
            role: client_1.Role.ADMIN,
            status: client_1.Status.ACTIVE,
        },
    });
    const analyst = await prisma.user.upsert({
        where: { email: "analyst@zorvyn.com" },
        update: {},
        create: {
            email: "analyst@zorvyn.com",
            password,
            role: client_1.Role.ANALYST,
            status: client_1.Status.ACTIVE,
        },
    });
    await prisma.record.createMany({
        data: [
            {
                amount: 12000,
                type: client_1.RecordType.INCOME,
                category: "Sales",
                date: new Date(),
                note: "Initial seed income",
                userId: admin.id,
            },
            {
                amount: 3500,
                type: client_1.RecordType.EXPENSE,
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
