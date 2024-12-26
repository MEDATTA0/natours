import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";

export const signup = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // eslint-disable-next-line no-undef
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      // eslint-disable-next-line no-undef
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
    next();
  }
);
