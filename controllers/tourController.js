import multer from "multer";
import sharp from "sharp";
import Tour from "../models/tourModel.js";
import AppError from "../utils/appError.js";
// import APIFeatures from "../utils/apiFeatures.js";
// import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";
export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, { path: "reviews" });
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

export const resizeTourImages = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns
   */
  async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      })
    );

    next();
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
// export const getAllTours = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    */
//   async (req, res, next) => {
//     // EXECUTE THE QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;
//     // query.sort().select().skip().limit()

//     // SEND RESPONSE
//     return res.status(200).json({
//       status: "success",
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   }
// );

// export const getTour = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    */
//   async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate("reviews");
//     // Tour.findOne({ _id: req.params.id })
//     if (!tour) {
//       next(new AppError("No tour found with that ID!", 404));
//     } else {
//       return res.status(200).json({
//         status: "success",
//         data: {
//           tour,
//         },
//       });
//     }
//   }
// );

// export const updateTour = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    */
//   async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!tour) {
//       return next(new AppError("No tour found with that ID!"));
//     }
//     return res.status(200).json({
//       status: "success",
//       data: { tour },
//     });
//   }
// );

// export const deleteTour = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    */
//   async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//       return next(new AppError("No tour found with that ID!", 404));
//     }
//     return res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   }
// );

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

export const getTourWithin = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [latitude, longitude] = latlng.split(",");

    const radius = distance / (unit === "mi" ? 3963.2 : 6378.1);
    console.log(radius);

    if (!latitude || !longitude)
      next(
        new AppError(
          "Please provide latitude and longitude in the format lat,lng",
          400
        )
      );

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
      },
    });

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { tours },
    });
  }
);

export const getDistances = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [latitude, longitude] = latlng.split(",");

    const multiplier = unit === "mi" ? 0.000621371 : 0.001;

    if (!latitude || !longitude)
      next(
        new AppError(
          "Please provide latitude and longitude in the format lat,lng",
          400
        )
      );
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude * 1, latitude * 1] },
          distanceField: "distance",
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    return res.status(200).json({
      status: "success",
      results: distances.length,
      data: { distances },
    });
  }
);
