import { Router } from "express";
import {
  getAccount,
  getLoginForm,
  getMyTours,
  getOverview,
  getTour,
  updateUserData,
} from "../controllers/viewController.js";
import { isLoggedIn, protect } from "../controllers/authController.js";
// import { createBookingCheckout } from "../controllers/bookingController.js";

const router = Router();

// render static files
router.get("/" /*createBookingCheckout*/, isLoggedIn, getOverview);
router.get("/login", isLoggedIn, getLoginForm);
router.get("/me", protect, getAccount);
router.post("/submit-user-data", protect, updateUserData);
router.get("/my-tours", protect, getMyTours);

router.get("/tour/:slug", isLoggedIn, getTour);

export default router;
