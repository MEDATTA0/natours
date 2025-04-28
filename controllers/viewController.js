import Tour from "../models/tourModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Booking from "../models/bookingModel.js";

// --- Centralized Content Security Policy ---
const csp =
  "default-src 'self' https://*.mapbox.com;" +
  "base-uri 'self';" +
  "block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "frame-src 'self' https://js.stripe.com;" + // Stripe Checkout frame
  "img-src 'self' data: blob:;" +
  "object-src 'none';" +
  "script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:;" + // Stripe JS, Mapbox JS, Cloudflare (if used), blob for workers
  "script-src-attr 'none';" +
  "style-src 'self' https: 'unsafe-inline';" +
  "upgrade-insecure-requests;" +
  // ***** FIXED: Added local API origin to connect-src *****
  "connect-src 'self' http://127.0.0.1:3000 https://*.mapbox.com https://api.mapbox.com https://api.stripe.com ws://localhost:*;" +
  "worker-src 'self' blob:"; // Mapbox GL JS uses workers

/**
 * @description Renders the overview page with all tours.
 * @route GET /
 */
export const getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Render the template using the tour data
  res.status(200).set("Content-Security-Policy", csp).render("overview", {
    title: "All Tours",
    tours,
  });
});

/**
 * @description Renders the tour details page for a specific tour.
 * @route GET /tour/:slug
 */
export const getTour = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns
   */
  async (req, res, next) => {
    // 1) Get the data for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: "reviews",
      select: "review rating user",
    });

    // 2) Check if the tour exists
    if (!tour) {
      return next(new AppError("There is no tour with that name.", 404));
    }

    // 3) Render the template using the tour data
    res
      .status(200)
      .set("Content-Security-Policy", csp)
      .render("tour", {
        title: `${tour.name} Tour`,
        tour,
      });
  }
);

/**
 * @description Renders the login form page.
 * @route GET /login
 */
export const getLoginForm = (req, res) => {
  res.status(200).set("Content-Security-Policy", csp).render("login", {
    title: "Log into your account",
  });
};

/**
 * @description Renders the user account page.
 * @route GET /me
 * @middleware protect (ensures user is logged in)
 */
export const getAccount = (req, res) => {
  // User data is available via res.locals.user from protect/isLoggedIn middleware
  res.status(200).set("Content-Security-Policy", csp).render("account", {
    title: "Your account",
    // Template should access user via `user` variable passed implicitly by Express/Pug from res.locals
  });
};

/**
 * @description Handles user data updates via traditional form submission (server-rendered).
 * @route POST /submit-user-data (Example route, adjust as needed if using this)
 * @note This is often replaced by client-side API calls (like in updateSettings.js).
 *       Consider if this server-side route is still necessary.
 */
export const updateUserData = catchAsync(async (req, res, next) => {
  // This only updates name and email, doesn't handle photo uploads like the API endpoint.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure model validations run
    }
  );

  // Re-rendering the page after update. The API approach handles this client-side with JS.
  res.status(200).set("Content-Security-Policy", csp).render("account", {
    title: "Your account",
    user: updatedUser, // Pass the newly updated user to the template
  });
});

/**
 * @description Renders the 'My Tours' page showing tours the user has booked.
 * @route GET /my-tours
 * @middleware protect
 */
export const getMyTours = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    // 1) Find all bookings for the current user
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Extract tour IDs from the bookings
    const tourIDs = bookings.map((booking) => booking.tour);

    // 3) Find tours corresponding to those IDs
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    // 4) Render the overview page with the user's booked tours
    return res
      .status(200)
      .set("Content-Security-Policy", csp)
      .render("overview", { title: "My Tours", tours }); // Changed title
  }
);
