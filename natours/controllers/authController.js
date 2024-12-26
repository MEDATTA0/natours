import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

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
    });
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
    next();
  }
);
