import AppError from "../utils/appError.js";
import { authValidator } from "../validators/authValidator.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const validateLogin = async (req, res, next) => {
  try {
    const body = await authValidator.signIn.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return next(new AppError(err.details[0].message, 400));
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const validateSignup = async (req, res, next) => {
  try {
    const body = await authValidator.signUp.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return next(new AppError(err.details[0].message, 400));
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const validateResetPassword = async (req, res, next) => {
  try {
    const body = await authValidator.resetPassword.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return next(new AppError(err.details[0].message, 400));
  }
};
