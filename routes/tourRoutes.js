import express from "express";
import "../controllers/tourController.js";
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from "../controllers/tourController.js";

const router = express.Router();

// router.param("id", checkID);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/").get(getAllTours).post(createTour);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

export default router;
