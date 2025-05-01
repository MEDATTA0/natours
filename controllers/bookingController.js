import Stripe from "stripe";

import Tour from "../models/tourModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Booking from "../models/bookingModel.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";
import User from "../models/userModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckout = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // success_url: `${req.protocol}://${req.get("host")}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      success_url: `${req.protocol}://${req.get("host")}/my-tours`,
      cancel_url: `${req.protocol}://${req.get("host")}/tours/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            unit_amount: tour.price * 100,
            currency: "usd",
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
              ],
            },
          },
          quantity: 1,
        },
      ],
    });

    // 3) Create session as response
    return res.status(200).json({
      status: "success",
      session,
    });
  }
);

// export const createBookingCheckout = catchAsync(
//   /**
//    *
//    * @param {import("express").Request} req
//    * @param {import("express").Response} res
//    * @param {import("express").NextFunction} next
//    * @returns
//    */
//   async (req, res, next) => {
//     // This is only TEMPORARY, because it's UNSECURE: everyone can make booking without paying
//     const { tour, user, price } = req.query;
//     if (!(tour && user && price)) {
//       return next();
//     }
//     await Booking.create({ tour, user, price });

//     return res.redirect(req.originalUrl.split("?")[0]);
//   }
// );

// /**
//  *
//  * @param {Stripe.CustomerSession} session
//  * @returns
//  */
const createBookingCheckout = async (session) => {
  try {
    const tour = session.client_reference_id;
    const user = await User.findOne({ email: session.customer_email });
    const price = session.display_items[0].amount / 100;
    return await Booking.create({ tour, user, price });
  } catch (err) {
    console.log(`Error while creating booking checkout: ${err}`);
    return null;
  }
};

export const webhookCheckout = catchAsync(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      // Create a stripe event
      event = await stripe.webhooks.constructEventAsync(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
      if (!(await createBookingCheckout(event.data.object))) {
        return next(
          new AppError("Error creating a booking. Please try later!", 500)
        );
      }
    }
    return res.status(200).json({ received: true });
  }
);

export const createBooking = createOne(Booking);
export const getBooking = getOne(Booking);
export const getAllBookings = getAll(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
