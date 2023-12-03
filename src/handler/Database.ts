import mongoose from "mongoose";
import logger from "../logging/logger";
import BookingModel from "../schemas/Booking";
import Booking from "../bookingservice/booking";

module.exports = () => {
  const MONGO_URI = process.env.DBURI;
  if (!MONGO_URI) return logger.info(`Mongo URI not found, skipping.`);
  mongoose
    .connect(`${MONGO_URI}/${process.env.DBNAME}`)
    .then(() => logger.info(`MongoDB connection has been established.`))
    .catch(() => logger.error(`MongoDB connection has been failed.`));
};

const db = mongoose.connection;

export const InsertBooking = async (reservation: Booking) => {
  try {
    const existingBooking = await BookingModel.findOne({ uniqueId: reservation.uniqueId });
    if (existingBooking?.huntingSpot === reservation.huntingSpot) {
      logger.info(
        `Booking with uniqueId ${reservation.uniqueId} already exists for hunting spot ${reservation.huntingSpot}. Not inserting.`
      );
    } else {
      let newBooking = new BookingModel({
        huntingPlace: reservation.huntingPlace,
        huntingSpot: reservation.huntingSpot,
        name: reservation.name,
        uniqueId: reservation.uniqueId,
        serverSaveStart: reservation.serverSaveStart,
        serverSaveEnd: reservation.serverSaveEnd,
        start: reservation.start,
        end: reservation.end,
      });
      await newBooking.save();
      logger.info(`Booking inserted successfully.`);
    }
  } catch (error: any) {
    logger.error(`Error inserting booking: ${error.message}`);
  }
};
