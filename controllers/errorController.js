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
 * @param {import("express").Response} res
 */
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 *
 * @param {AppError} err
 * @param {import("express").Response} res
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details.
  else {
    // 1) Log error
    console.log("ERROR: ", err);

    // 2) Send generate message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
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
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // let error = { ...err }; error and err don't have the same key:value
    let error = {};
    if (err.name === "CastError") error = handleCastErrorDB(err);
    else if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    else if (err.name === "ValidationError")
      error = handleValidationErrorDB(err);
    else if (err.name === "JsonWebTokenError") error = handleJWTError();
    else if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    else error = err;
    return sendErrorProd(error, res);
  }
};
