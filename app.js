import express from "express";
import morgan from "morgan";
import tourRouter from "./routes/tourRoutes.js";
import userRouter from "./routes/userRoutes.js";
import AppError from "./utils/appError.js";
import { globalErrorHandler } from "./controllers/errorController.js";

const app = express();

// 1) MIDDLEWARES
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(
  // eslint-disable-next-line no-undef
  express.static(`${process.cwd()}/public`, {
    dotfiles: "ignore",
    etag: true,
    maxAge: "1d",
  })
);
app.use((req, res, next) => {
  console.log("Hello from the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
export default app;
