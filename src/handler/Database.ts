import mongoose from "mongoose";
import logger from "../logging/logger";

module.exports = () => {
  const MONGO_URI = process.env.DBURI;
  if (!MONGO_URI) return logger.info(`Mongo URI not found, skipping.`);
  mongoose.pluralize(null);
  mongoose
    .connect("mongodb://vmi1535787.contaboserver.net/TibiaReservationDB",{user:"tibiabot", pass:"77!%+y~mD{TZAq0|ia~",authSource:"admin"})
    .then(() => logger.info(`MongoDB connection has been established.`))
    .catch((error) => {logger.error(`MongoDB connection has been failed.`); console.log(error)});
};
