import "./env.js";
import app from "./app.js";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION, shutting down...");
  console.log(err);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then((conn) => {
  // console.log(conn.connections);
  console.log("DB connection successful!");
});

// START SERVER
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION, shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
