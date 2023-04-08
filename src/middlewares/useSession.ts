import session from "express-session";
import { sessionConfig } from "../config";

export default () => session(sessionConfig);
