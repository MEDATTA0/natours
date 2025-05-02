import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";

import tourRouter from "./routes/tourRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import viewRouter from "./routes/viewRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import AppError from "./utils/appError.js";

import sanitizeMiddleware from "./middlewares/sanitizeMiddleware.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import hpp from "hpp";
import { webhookCheckout } from "./controllers/bookingController.js";

const app = express();

app.enable("trust proxy");

// Setting the view template
app.set("view engine", "pug");
app.set("views", `${process.cwd()}/views`);

// Serving static files
app.use(
  // eslint-disable-next-line no-undef
  express.static(`${process.cwd()}/public`, {
    dotfiles: "ignore",
    etag: true,
    maxAge: "1d",
  })
);

// 1) MIDDLEWARES
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(
//   cors({
//     origin: "https://www.natours.com",
//   })
// );

app.options("*", cors());
// app.options("/api/v1/tours/:id", cors())

// Set security HTTP Headers
app.use(helmet());
// Development logging
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/api", limiter);
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());

// xss-clean package is deprecated, so you have to install sanitize-html package and
// create your own sanitizer
// Data sanitization against XSS
app.use(sanitizeMiddleware);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  // console.log("Hello from the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
export default app;
