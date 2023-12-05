import mongoose, { model } from "mongoose";
import logger from "../logging/logger";
import BookingSchema from "../schemas/Booking";
import Booking from "./booking";
import { DatabaseResultForGroup, DatabaseResultForSummary, IBooking } from "../types";
import dayjs from "dayjs";

export const InsertBooking = async (reservation: Booking) => {
  try {
    const BookingModel = model<IBooking>("booking", BookingSchema, reservation.huntingPlace);
    const existing = await BookingModel.findOne({
      uniqueId: reservation.uniqueId,
      deletedAt: null,
    });

    if (existing?.huntingSpot === reservation.huntingSpot) {
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
        createdAt: reservation.createdAt,
        displaySlot: reservation.displaySlot,
      });

      await newBooking.save();
      logger.info(`Booking inserted successfully.`);
    }
  } catch (error: any) {
    logger.error(`Error inserting booking: ${error.message}`);
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
      result[collectionName] = documents; // Store documents in the result object
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
      console.log(collectionName);
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
      console.log(collectionName);
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
          const displaySlot = dayjs(booking.displaySlot).format(); // Format the displaySlot if needed

          if (!result[collectionName][huntingSpot][displaySlot]) {
            result[collectionName][huntingSpot][displaySlot] = [];
          }

          // Push the booking to the array
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
