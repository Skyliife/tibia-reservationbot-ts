import logger from "../logging/logger";
import BookingModel from "../schemas/Booking";
import Booking from "./booking";

export const InsertBooking = async (reservation: Booking) => {
  try {
    const existingBooking = await BookingModel.findOne({ uniqueId: reservation.uniqueId });
    if (existingBooking?.huntingSpot === reservation.huntingSpot) {
      logger.warn(
        `Booking with uniqueId ${reservation.uniqueId}, name: ${reservation.name} already exists for hunting spot ${reservation.huntingSpot}. Not inserting.`
      );
      throw new Error(
        `You already have a reservation for the ${reservation.huntingSpot} - use unbook first if you want to change your reservation!`
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
