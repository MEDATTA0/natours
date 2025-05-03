import { configDotenv } from "dotenv";
// configDotenv({ path: "./config/.env" });

const environment = process.env.NODE_ENV || "development";
let envFile;
switch (environment) {
  case "production":
    envFile = "./config/.env.production";
    break;
  case "development":
    envFile = "./config/.env.development";
    break;
  case "test":
    envFile = "./config/.env.test";
    break;
}

configDotenv({ path: envFile });
console.log(`environment: ${environment}`);
