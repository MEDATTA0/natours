import AppError from "../utils/appError.js";

/**
 *
 * @param {*} err
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value[0]}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((element) => element.message);
  // console.log(errors);
  const message = `Invalid data. ${errors.join(". ")}!`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/**
 *
 * @param {AppError} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const sendErrorDev = (err, req, res) => {
  // A) API errors
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE errors
  console.log("ERROR: 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

/**
 *
 * @param {AppError} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const sendErrorProd = (err, req, res) => {
  // A) API errors
  if (req.originalUrl.startsWith("/api")) {
    // 1) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // 2) Programming or other unknown error: don't leak error details.
    // Log error
    console.log("ERROR: 💥", err);

    // Send generate message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
  // B) RENDERED WEBSITE
  // 1) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }

  // 2) Programming or other unknown error: don't leak error details.
  // Log error
  console.log("ERROR: 💥", err);

  // Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later.",
  });
};

/**
 *
 * @param {AppError} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const globalErrorHandler = (err, req, res, next) => {
  // console.log(err.message);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  let error = {};
  if (err.name === "CastError") error = handleCastErrorDB(err);
  else if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  else if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  else if (err.name === "JsonWebTokenError") error = handleJWTError();
  else if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  else error = err;
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // let error = { ...err }; error and err don't have the same key:value
    return sendErrorProd(error, req, res);
  }
};
