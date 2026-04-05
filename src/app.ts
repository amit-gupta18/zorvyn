import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import recordRoutes from "./modules/record/record.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { ApiError } from "./utils/apiError";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Zorvyn API is running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use((_req, _res, next) => next(new ApiError(404, "Route not found")));
app.use(errorMiddleware);

export default app;