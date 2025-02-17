import fs from "fs";
import "./../../env.js";
import mongoose from "mongoose";
import Tour from "../../models/tourModel.js";
import User from "../../models/userModel.js";
import Review from "../../models/reviewModel.js";

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

console.log();
mongoose.connect(DB).then((conn) => {
  // console.log(conn.connections);
  console.log("DB connection successful!\n", conn);
});

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync("./dev-data/data/tours.json", "utf-8")
);
const users = JSON.parse(
  fs.readFileSync("./dev-data/data/users.json", "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync("./dev-data/data/reviews.json", "utf-8")
);

// IMPORT DATA TO DATABEASE
const importData = async () => {
  try {
    await Promise.all([
      Tour.create(tours),
      User.create(users, { validateBeforeSave: false }),
      Review.create(reviews),
    ]);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

// DELETE ALL DATA FROM DATADASE
const deleteData = async () => {
  try {
    await Promise.all([
      Tour.deleteMany({}),
      User.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("Data successfully deleted!");
    console.log(DB);
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
console.log(process.argv);
