import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import { signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
