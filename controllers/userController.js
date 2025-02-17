import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) newObj[field] = obj[field];
  });
  return newObj;
};

// export const getAllUsers = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    */
//   async (req, res) => {
//     const users = await User.find();
//     // SEND RESPONSE
//     res.status(200).json({
//       status: "success",
//       results: users.length,
//       data: { users },
//     });
//   }
// );

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updateMyPassword.",
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      data: { updatedUser },
    });
  }
);

export const deleteMe = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    return res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Please use /signup instead.",
  });
};

export const getAllUsers = getAll(User);
export const getUser = getOne(User);

// Do NOT update passwords with this!
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
