import { Router } from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  getCheckout,
  updateBooking,
} from "../controllers/bookingController.js";

const router = Router();

router.use(protect);
router.get("/checkout-session/:tourId", getCheckout);

// Restricted to admin
router.use(restrictTo("admin"));
router.route("/").get(getAllBookings).post(createBooking);
router.route("/:id").get(getBooking).patch(updateBooking).delete(deleteBooking);

export default router;
