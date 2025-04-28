import { Router } from "express";
import reviewRouter from "./reviewRoutes.js";

import "../controllers/tourController.js";
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTour,
  getTourStats,
  getTourWithin,
  resizeTourImages,
  updateTour,
  uploadTourImages,
} from "../controllers/tourController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = Router();

// router.param("id", checkID);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStats);
router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router
  .route("/tours-distance/distance/:distance/center/:latlng/unit/:unit")
  .get(getTourWithin);
// /tours-distance?distance=223&center=-40,45&unit=mi
// /tours-distance/223/center/-40,45/unit/mi

router.route("/distances/:latlng/unit/:unit").get(getDistances);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

// Redirection to review stuffs

router.use("/:tourId/reviews", reviewRouter);

export default router;
