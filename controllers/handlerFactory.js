import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

/**
 *
 * @param {import("mongoose").Model} Model
 * @returns
 */
export const createOne = (Model) =>
  catchAsync(
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async (req, res, next) => {
      const newDoc = await Model.create(req.body);
      // console.log(newTour);
      return res.status(201).json({
        status: "success",
        data: {
          data: newDoc,
        },
      });
    }
  );

/**
 *
 * @param {import("mongoose").Model} Model
 * @returns
 */
export const getAll = (Model) =>
  catchAsync(
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async (req, res, next) => {
      // To allow for nested GET reviews on tour
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      // EXECUTE THE QUERY
      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const docs = await features.query;
      // const docs = await features.query.explain();
      // query.sort().select().skip().limit()

      // SEND RESPONSE
      return res.status(200).json({
        status: "success",
        results: docs.length,
        data: {
          data: docs,
        },
      });
    }
  );

/**
 *
 * @param {import("mongoose").Model} Model
 * @param {Object} popOptions
 * @returns
 */
export const getOne = (Model, popOptions) =>
  catchAsync(
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async (req, res, next) => {
      let query = Model.findById(req.params.id);
      if (popOptions) query.populate(popOptions);
      const doc = await query;
      // Tour.findOne({ _id: req.params.id })
      if (!doc) {
        next(new AppError("No document found with that ID!", 404));
      } else {
        return res.status(200).json({
          status: "success",
          data: {
            data: doc,
          },
        });
      }
    }
  );

/**
 *
 * @param {import("mongoose").Model} Model
 * @returns
 */
export const updateOne = (Model) =>
  catchAsync(
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      // console.log(doc);
      if (!doc) {
        return next(new AppError("No document found with that ID!"));
      }
      return res.status(200).json({
        status: "success",
        data: { doc },
      });
    }
  );

/**
 *
 * @param {import("mongoose").Model} Model
 * @returns
 */
export const deleteOne = (Model) =>
  catchAsync(
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return next(new AppError("No document found with that ID!", 404));
      }
      return res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );
