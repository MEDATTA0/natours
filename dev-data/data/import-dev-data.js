import fs from "fs";
import "./../../env.js";
import mongoose from "mongoose";
import Tour from "../../models/tourModel.js";

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((conn) => {
  // console.log(conn.connections);
  console.log("DB connection successful!");
});

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync("./dev-data/data/tour-simple.json", "utf-8")
);

// IMPORT DATA TO DATABEASE
const importData = async () => {
  try {
    await Tour.create(tours);
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
    await Tour.deleteMany({});
    console.log("Data successfully deleted!");
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
