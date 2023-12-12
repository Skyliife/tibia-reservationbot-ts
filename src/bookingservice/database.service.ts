import logger from "../logging/logger";
import BookingSchema from "../schemas/Booking";
import Booking from "./booking";

import {DatabaseResultForGroup, DatabaseResultForSummary, IBooking} from "../types";
import dayjs, {Dayjs} from "dayjs";
import {
    areAllCurrentReservationsFromUserWithinRoleDuration,
    isCurrentReservationOverlappingWithExistingReservations
} from "../utils";
import {REFUGIADB} from "../database/RefugiaDatabase";
import {GODSDB} from "../database/GodsDatabase";

//how to add a reservation to different databases?
export const InsertBooking = async (reservation: Booking, databaseId: string) => {
    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>("booking", BookingSchema, reservation.huntingPlace);
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
        // Example: Connect to another database
        BookingModel = REFUGIADB.model<IBooking>("booking", BookingSchema, reservation.huntingPlace);
    } else {
        // Handle the case where the database ID is not recognized
        throw new Error(`Unknown database ID: ${databaseId}`);
    }

    const existingReservationsForID = await BookingModel.find({
        huntingSpot: reservation.huntingSpot,
        uniqueId: reservation.uniqueId,
        deletedAt: null,
        displaySlot: reservation.displaySlot,
    });

    if (existingReservationsForID.length >= 4) {
        throw new Error(`You have reached the maximum of 4 reservations for hunting spot ${reservation.huntingSpot}!`);
    }

    const isWithinRoleDuration = areAllCurrentReservationsFromUserWithinRoleDuration(reservation.roleDuration, reservation, existingReservationsForID);


    const existingReservationsForHuntingSpot = await BookingModel.find({
        huntingSpot: reservation.huntingSpot,
        deletedAt: null,
    });
    const isOverlapping = isCurrentReservationOverlappingWithExistingReservations(
        reservation,
        existingReservationsForHuntingSpot
    );

    logger.info(`Reservation is overlapping: ${isOverlapping}`);
    const dev = isWithinRoleDuration;
    //const dev = false;
    if (!dev) {
        logger.warn(`Booking with uniqueId ${reservation.uniqueId}, name: ${reservation.name.displayName} already exists for hunting spot ${reservation.huntingSpot}. Not inserting.`);
        throw new Error(`Your maximum reservation time of ${reservation.roleDuration / 60} hours is exceeded: ${reservation.huntingSpot} - use "/unbook" first if you want to change your reservation!`);
    } else if (isOverlapping) {
        logger.warn(`Overlapping reservation found!`);
        throw new Error(`Your reservation for the ${reservation.huntingSpot}, overlaps with an existing reservation}!`);
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

export const getBookingsForUserId = async (collectionName: string | undefined, userId: string, databaseId: string) => {
    const formattedArray: { formattedString: string; reservation: IBooking }[] = [];

    if (collectionName === undefined) return formattedArray;
    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>("booking", BookingSchema, collectionName);

    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
        // Example: Connect to another database
        BookingModel = REFUGIADB.model<IBooking>("booking", BookingSchema, collectionName);
    } else {
        // Handle the case where the database ID is not recognized
        throw new Error(`Unknown database ID: ${databaseId}`);
    }

    //console.log(bookings.map((e) => e.uniqueId));
    const result = await BookingModel.find({uniqueId: userId, deletedAt: null}).sort({
        start: 1,
    });
    result.forEach((item) => {
        const {huntingPlace, huntingSpot, start, end} = item;
        const formattedString = `Reservation ${huntingSpot} - from ${dayjs(start).format("D.M HH:mm")} to ${dayjs(end).format("D.M HH:mm")}`;
        formattedArray.push({formattedString: formattedString, reservation: item});
    })


    return formattedArray;
};

export const deleteBookingsForUserId = async (
    collectionName: string,
    huntingSpot: string,
    userId: string,
    start: Dayjs,
    end: Dayjs,
    databaseId: string
) => {

    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>("booking", BookingSchema, collectionName);

    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
        // Example: Connect to another database
        BookingModel = REFUGIADB.model<IBooking>("booking", BookingSchema, collectionName);
    } else {
        // Handle the case where the database ID is not recognized
        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    // Get bookings for the specified userId


    const bookingToDelete = await BookingModel.findOne({
        uniqueId: userId,
        deletedAt: null,
        huntingSpot: huntingSpot,
        start: start,
        end: end
    });
    if (!bookingToDelete) {
        throw new Error("No matching booking found for deletion");
    }
    await BookingModel.deleteOne({
        uniqueId: userId,
        deletedAt: null,
        huntingSpot: huntingSpot,
        start: start,
        end: end
    });

    logger.info(`Bookings for userId: ${userId} on spot: ${huntingSpot} deleted.`);

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

export const getAllCollectionsAndValues = async (databaseId: string) => {
    //mongoose.pluralize(null);
    //await mongoose.connect(`mongodb://127.0.0.1:27017/TibiaBotReservationDB`);
    const result: DatabaseResult = {}; // Object to store collections and documents


    let db;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        db = GODSDB.db;
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
        // Example: Connect to another database
        db = REFUGIADB.db;
    } else {
        // Handle the case where the database ID is not recognized
        throw new Error(`Unknown database ID: ${databaseId}`);
    }


    // List all collections in the database
    const collections = await db.listCollections().toArray();
    const names = collections.map((e) => `${e.name}`);

    logger.debug(`Found ${collections.length} collections: [${names}]`);

    // Iterate over collections
    for (const collection of collections) {
        const collectionName = collection.name;

        result[collectionName] = await db
            .collection<IBooking>(collectionName)
            .find({deletedAt: null})
            .toArray();
        //console.log(`Collection: ${collectionName}`);
    }
    //console.log(result);
    logger.debug("DONE! getting all collections and documents");
    return result; // Return the result object with collections and documents

};

export const getResultForSummary = async (databaseId: string) => {

    let db;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        db = GODSDB.db;
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
        // Example: Connect to another database
        db = REFUGIADB.db;
    } else {
        // Handle the case where the database ID is not recognized
        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    const result: DatabaseResultForSummary = {};

    const collections = await db.listCollections().toArray();
    const names = collections.map((e) => `${e.name}`);

    logger.debug(`Found ${collections.length} collections: [${names}]`);
    for (const collection of collections) {
        const collectionName = collection.name;
        //console.log(collectionName);
        result[collectionName] = {};

        const uniqueHuntingSpots = await db
            .collection<IBooking>(collectionName)
            .distinct("huntingSpot", {deletedAt: null});
        for (const huntingSpot of uniqueHuntingSpots) {
            result[collectionName][huntingSpot] = [];
            const bookingsForHuntingSpot = await db
                .collection<IBooking>(collectionName)
                .find({huntingSpot, deletedAt: null})
                .toArray();

            result[collectionName][huntingSpot] = bookingsForHuntingSpot.sort((a, b) =>
                dayjs(a.start).diff(dayjs(b.start))
            );
        }
    }
    //console.log(JSON.stringify(result, null, 2));
    logger.debug("DONE! Getting grouped collections and values");
    return result;


};

export const getResultForGroups = async (collection: string | undefined, databaseId: string) => {
    let db;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        db = GODSDB.db;
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
        // Example: Connect to another database
        db = REFUGIADB.db;
    } else {
        // Handle the case where the database ID is not recognized
        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    const result: DatabaseResultForGroup = {};

    const collections = await db.listCollections({name: collection}).toArray();
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
            .distinct("huntingSpot", {deletedAt: null});
        for (const huntingSpot of uniqueHuntingSpots) {
            result[collectionName][huntingSpot] = {};

            const bookingsForHuntingSpot = await db
                .collection<IBooking>(collectionName)
                .find({huntingSpot, deletedAt: null})
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
    logger.debug("DONE! Getting grouped collections and values");
    return result;
};
