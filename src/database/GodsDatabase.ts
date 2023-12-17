import mongoose from "mongoose";
import logger from "../logging/logger";

const MONGO_URI = process.env.DBURI_GODS
mongoose.pluralize(null);

export const GODSDB = mongoose.createConnection(MONGO_URI);
logger.info(`Connected to GodsDB.`);
