import Tour from "../models/tourModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createTour = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    // console.log(newTour);
    return res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  }
);

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {import("express").NextFunction} next
 */
export const aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  return next();
};

export const getAllTours = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    // EXECUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // query.sort().select().skip().limit()

    // SEND RESPONSE
    return res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  }
);

export const getTour = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })
    if (!tour) {
      next(new AppError("No tour found with that ID!", 404));
    } else {
      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    }
  }
);

export const updateTour = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return next(new AppError("No tour found with that ID!"));
    }
    return res.status(200).json({
      status: "success",
      data: { tour },
    });
  }
);

export const deleteTour = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return next(new AppError("No tour found with that ID!", 404));
    }
    return res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const getTourStats = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      { $match: { ratingAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRating: { $sum: "$ratingQuantity" },
          avgRating: { $avg: "$ratingAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      { $sort: { avgPrice: 1 } },
      // { $match: { _id: { $ne: "EASY" } } },
    ]);
    return res.status(200).json({ status: "success", data: { stats } });
  }
);

export const getMonthlyPlan = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      { $unwind: "$startDates" },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      { $sort: { numberTourStarts: -1 } },
      { $limit: 12 },
    ]);

    return res.status(200).json({
      status: "success",
      results: plan.length,
      data: { plan },
    });
  }
);
