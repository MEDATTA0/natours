/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts.js";

export const login = async (email, password) => {
  try {
    const res = await axios.post(
      "http://localhost:3000/api/v1/users/login",
      { email, password },
      { withCredentials: true }
    );

    if (res.data.status === "success") {
      console.log("Logged in");

      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/v1/users/logout", {
      withCredentials: true,
    });
    if ((res.data.status = "success")) {
      showAlert("success", "Logged out successfully!");
      window.setTimeout(() => {
        location.assign("http://localhost:3000");
      }, 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", "Error logging out! Try again.");
  }
};
