import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourUserIds,
  updateReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = Router({ mergeParams: true });

router.use(protect);
router
  .route("/")
  .post(restrictTo("user"), setTourUserIds, createReview)
  .get(getAllReviews);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

export default router;
