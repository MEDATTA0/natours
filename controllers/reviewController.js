import Review from "../models/reviewModel.js";
// import AppError from "../utils/appError.js";
// import catchAsync from "../utils/catchAsync.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";

export const getAllReviews = getAll(Review);
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// export const getAllReviews = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    */
//   async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);
//     if (!reviews.length) return next(new AppError("No review found!", 404));

//     return res.status(200).json({
//       status: "success",
//       results: reviews.length,
//       data: { reviews },
//     });
//   }
// );

// export const createReview = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    */
//   async (req, res, next) => {
//
//     const newReview = await Review.create(req.body);
//     return res.status(201).json({
//       status: "success",
//       data: { review: newReview },
//     });
//   }
// );
