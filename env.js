import { configDotenv } from "dotenv";
// configDotenv({ path: "./config/.env" });

const environment = process.env.NODE_ENV || "development";
const envFile =
  environment === "production"
    ? "./config/.env.production"
    : "./config/.env.development";

configDotenv({ path: envFile });
console.log(`environment: ${environment}`);
