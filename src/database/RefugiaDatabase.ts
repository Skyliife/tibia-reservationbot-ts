import mongoose from "mongoose";
import logger from "../logging/logger";

const MONGO_URI = process.env.DBURI_REFUGIA
mongoose.pluralize(null);

export const REFUGIADB = mongoose.createConnection(MONGO_URI);
logger.info(`Connected to RefugiaDB.`);
