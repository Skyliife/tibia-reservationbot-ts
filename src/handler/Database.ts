import mongoose from "mongoose";
import logger from "../logging/logger";

module.exports = () => {
  const MONGO_URI = process.env.DBURI;
  if (!MONGO_URI) return logger.info(`Mongo URI not found, skipping.`);
  mongoose
    .connect(`${MONGO_URI}/${process.env.DBNAME}`)
    .then(() => logger.info(`MongoDB connection has been established.`))
    .catch(() => logger.error(`MongoDB connection has been failed.`));
};

const db = mongoose.connection;
