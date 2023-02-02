import dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

const port = parseInt(process.env.PORT ?? "8080", 10);

export { port };
