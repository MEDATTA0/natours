/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts.js";

// Initialize Stripe.js with your publishable key
const stripe = Stripe(
  "pk_test_51RDKMHPr3TWCxaOhuKetrpeB39IKEc2Fcyzk4HaZljB2vQtKKVcOmFs7KJohdWe92oNhAwtoeaNl2M3SznVSCRV700EJwDWZo6"
);

export const bookTour = async (tourId) => {
  const bookBtn = document.getElementById("book-tour"); // Get button for potential text reset

  try {
    // 1) Get checkout session from API (use relative URL)
    const sessionRes = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
      { withCredentials: true } // Important if your backend relies on cookies for auth
    );

    if (sessionRes.data.status !== "success") {
      throw new Error(
        sessionRes.data.message || "Could not retrieve checkout session"
      );
    }

    const sessionId = sessionRes.data.session.id;

    // 2) Redirect to Stripe Checkout using the session ID
    await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    // Note: If redirectToCheckout is successful, the user navigates away,
    // so code here might not execute unless there's an immediate error
    // before redirection happens.
  } catch (err) {
    console.error("Error during booking redirect:", err);
    const message =
      err.response?.data?.message ||
      err.message ||
      "Could not redirect to payment page. Please try again.";
    showAlert("error", message);

    // Re-enable the button and reset text if it exists
    if (bookBtn) {
      bookBtn.disabled = false;
      bookBtn.textContent = "Book tour now!";
    }
  }
};
