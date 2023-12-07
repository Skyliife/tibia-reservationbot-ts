import mongoose, { model } from "mongoose";
import logger from "../logging/logger";
import BookingSchema from "../schemas/Booking";
import Booking from "./booking";
import { DatabaseResultForGroup, DatabaseResultForSummary, IBooking } from "../types";
import dayjs from "dayjs";
import { isCurrentReservationOverlappingWithExistingReservations } from "../utils";

export const InsertBooking = async (reservation: Booking) => {
  const BookingModel = model<IBooking>("booking", BookingSchema, reservation.huntingPlace);
  const existing = await BookingModel.findOne({
    huntingSpot: reservation.huntingSpot,
    uniqueId: reservation.uniqueId,
    deletedAt: null,
  });

  const existingReservationsForHuntingSpot = await BookingModel.find({
    huntingSpot: reservation.huntingSpot,
    deletedAt: null,
  });
  const isOverlapping = isCurrentReservationOverlappingWithExistingReservations(
    reservation,
    existingReservationsForHuntingSpot
  );
  console.log("---------------------------------------------", existing);
  logger.info(`isOverlapping: ${isOverlapping}`);
  //const dev = existing;
  const dev = false;
  if (dev) {
    logger.warn(
      `Booking with uniqueId ${reservation.uniqueId}, name: ${reservation.name} already exists for hunting spot ${reservation.huntingSpot}. Not inserting.`
    );
    throw new Error(
      `You already have a current reservation for huntinspot: ${reservation.huntingSpot} - use "/unbook" first if you want to change your reservation!`
    );
  } else if (isOverlapping) {
    logger.warn(`Overlapping reservation found!`);
    throw new Error(
      `Your reservation for the ${reservation.huntingSpot}, overlaps with an existing reservation}!`
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
      createdAt: reservation.createdAt,
      displaySlot: reservation.displaySlot,
    });

    await newBooking.save();
    logger.info(`Booking inserted successfully.`);
  }
};

export const getBookingsForUserId = async (collectionName: string | undefined, userId: string) => {
  try {
    if (collectionName === undefined) return;
    const BookingModel = model<IBooking>("booking", BookingSchema, collectionName);
    const bookings = await BookingModel.find({ uniqueId: userId, deletedAt: null }).sort({
      start: 1,
    });
    console.log(bookings.map((e) => e.uniqueId));
    return bookings;
  } catch (error: any) {
    logger.error(`Error retrieving bookings for userId ${userId}: ${error.message}`);
    throw new Error(error.message);
  } finally {
  }
};

export const deleteBookingsForUserId = async (
  collectionName: string,
  huntingSpot: string,
  userId: string
) => {
  try {
    // Get bookings for the specified userId
    const bookings = await getBookingsForUserId(collectionName, userId);
    if (bookings === undefined) return;

    console.log(`Bookings for userId ${userId} marked as deleted.`);
  } catch (error: any) {
    // Handle errors appropriately (e.g., log or throw)
    console.error(`Error deleting bookings for userId ${userId}: ${error.message}`);
    throw error;
  } finally {
    logger.info("deleted");
  }
};

// export const testingInClass = async () => {
//   mongoose.pluralize(null);
//   await mongoose.connect(`mongodb://127.0.0.1:27017/TibiaBotReservationDB`);

//   const result: Record<string, unknown> = {}; // Object to store collections and documents
//   console.log("connected");
//   try {
//     const db = mongoose.connection.db;

//     // List all collections in the database
//     const collections = await db.listCollections().toArray();
//     const names = collections.map((e) => `${e.name}`);

//     logger.debug(`Found ${collections.length} collections: [${names}]`);

//     // Iterate over collections
//     for (const collection of collections) {
//       const collectionName = collection.name;

//       // Fetch documents from the collection
//       try {
//         const documents = await db
//           .collection<IBooking>(collectionName)
//           .find({ deletedAt: null })
//           .toArray();
//         result[collectionName] = documents; // Store documents in the result object
//         //console.log(`Collection: ${collectionName}`);
//       } catch (error) {
//         logger.error(`Error fetching documents from ${collectionName}:`, error);
//       }
//     }
//     console.log(result);
//     return result; // Return the result object with collections and documents
//   } catch (error: any) {
//     logger.error(`Error retrieving collections and values: ${error.message}`);
//   } finally {
//     mongoose.connection.close(); // Close the Mongoose connection
//   }
// };
type DatabaseResult = {
  [collectionName: string]: IBooking[];
};

export const getAllCollectionsAndValues = async () => {
  const result: DatabaseResult = {}; // Object to store collections and documents
  try {
    const db = mongoose.connection.db;

    // List all collections in the database
    const collections = await db.listCollections().toArray();
    const names = collections.map((e) => `${e.name}`);

    logger.debug(`Found ${collections.length} collections: [${names}]`);

    // Iterate over collections
    for (const collection of collections) {
      const collectionName = collection.name;

      const documents = await db
        .collection<IBooking>(collectionName)
        .find({ deletedAt: null })
        .toArray();
      result[collectionName] = documents;
      //console.log(`Collection: ${collectionName}`);
    }
    //console.log(result);
    return result; // Return the result object with collections and documents
  } catch (error: any) {
    logger.error(`Error retrieving collections and values: ${error.message}`);
  } finally {
    logger.debug("DONE! getting all collections and documents");
    return result;
  }
};

export const getResultForSummary = async () => {
  // mongoose.pluralize(null);
  // await mongoose.connect(`mongodb://127.0.0.1:27017/TibiaBotReservationDB`);
  const db = mongoose.connection.db;
  const result: DatabaseResultForSummary = {};
  try {
    const collections = await db.listCollections().toArray();
    const names = collections.map((e) => `${e.name}`);

    logger.debug(`Found ${collections.length} collections: [${names}]`);
    for (const collection of collections) {
      const collectionName = collection.name;
      //console.log(collectionName);
      result[collectionName] = {};

      const uniqueHuntingSpots = await db
        .collection<IBooking>(collectionName)
        .distinct("huntingSpot", { deletedAt: null });
      for (const huntingSpot of uniqueHuntingSpots) {
        result[collectionName][huntingSpot] = [];
        const bookingsForHuntingSpot = await db
          .collection<IBooking>(collectionName)
          .find({ huntingSpot, deletedAt: null })
          .toArray();

        const sortedBookings = bookingsForHuntingSpot.sort((a, b) =>
          dayjs(a.start).diff(dayjs(b.start))
        );

        result[collectionName][huntingSpot] = sortedBookings;
      }
    }
    //console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    logger.error(`Error retrieving grouped collections and values: ${error.message}`);
  } finally {
    logger.debug("DONE! Getting grouped collections and values");
    return result;
  }
};

export const getResultForGroups = async (collection: string | undefined) => {
  //mongoose.pluralize(null);
  //await mongoose.connect(`mongodb://127.0.0.1:27017/TibiaBotReservationDB`);
  const db = mongoose.connection.db;
  const result: DatabaseResultForGroup = {};
  try {
    const collections = await db.listCollections({ name: collection }).toArray();
    if (!collections) {
      logger.error(`Collection '${collection}' not found.`);
      return result;
    }
    const names = collections.map((e) => `${e.name}`);

    logger.debug(`Found ${collections.length} collections: [${names}]`);
    for (const collection of collections) {
      const collectionName = collection.name;
      //console.log(collectionName);
      result[collectionName] = {};

      const uniqueHuntingSpots = await db
        .collection<IBooking>(collectionName)
        .distinct("huntingSpot", { deletedAt: null });
      for (const huntingSpot of uniqueHuntingSpots) {
        result[collectionName][huntingSpot] = {};

        const bookingsForHuntingSpot = await db
          .collection<IBooking>(collectionName)
          .find({ huntingSpot, deletedAt: null })
          .toArray();

        for (const booking of bookingsForHuntingSpot) {
          const displaySlot = dayjs(booking.displaySlot).format();

          if (!result[collectionName][huntingSpot][displaySlot]) {
            result[collectionName][huntingSpot][displaySlot] = [];
          }

          result[collectionName][huntingSpot][displaySlot].push(booking);
        }

        // Sort the bookings for each displaySlot by startTime
        for (const displaySlot in result[collectionName][huntingSpot]) {
          if (result[collectionName][huntingSpot].hasOwnProperty(displaySlot)) {
            result[collectionName][huntingSpot][displaySlot].sort((a, b) =>
              dayjs(a.start).diff(dayjs(b.start))
            );
          }
        }
        // Sort the outer object keys (displaySlot)
        const sortedDisplaySlots = Object.keys(result[collectionName][huntingSpot]).sort((a, b) =>
          dayjs(a).diff(dayjs(b))
        );

        const sortedResult: any = {};
        for (const displaySlot of sortedDisplaySlots) {
          sortedResult[displaySlot] = result[collectionName][huntingSpot][displaySlot];
        }

        // Update the result
        result[collectionName][huntingSpot] = sortedResult;
      }
    }
    //console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    logger.error(`Error retrieving grouped collections and values: ${error.message}`);
  } finally {
    logger.debug("DONE! Getting grouped collections and values");
    return result;
  }
};
