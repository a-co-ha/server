import dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

const port = parseInt(process.env.PORT ?? "8080", 10);
const mongoDBUri = process.env.DB_MONGO || "not found";
const host = process.env.HOST || "localhost";

export { port, mongoDBUri, host };
