import BookingSchema from "../schemas/Booking";
import Booking from "./booking";

import {DatabaseResult, DatabaseResultForGroup, DatabaseResultForSummary, IBooking, IStatistics} from "../types";
import dayjs, {Dayjs} from "dayjs";
import {
    areAllCurrentReservationsFromUserWithinRoleDuration,
    isCurrentReservationOverlappingWithExistingReservations
} from "../utils";
import {REFUGIADB} from "../database/RefugiaDatabase";
import {GODSDB} from "../database/GodsDatabase";
import {ChatInputCommandInteraction, TextChannel} from "discord.js";
import StatisticsSchema from "../schemas/StatisticsSchema";
import LocaleManager from "../locale/LocaleManager";

//how to add a reservation to different databases?
export const InsertBooking = async (reservation: Booking, databaseId: string) => {
    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>("booking", BookingSchema, reservation.huntingPlace);
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        BookingModel = REFUGIADB.model<IBooking>("booking", BookingSchema, reservation.huntingPlace);
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }

    const existingReservationsForID = await BookingModel.find({
        huntingSpot: reservation.huntingSpot,
        uniqueId: reservation.uniqueId,
        deletedAt: null,
        displaySlot: reservation.displaySlot,
    });

    if (existingReservationsForID.length >= 4) {
        const message = LocaleManager.translate("insertBooking",{prop: `${reservation.huntingSpot}`});
        throw new Error(message);
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

    console.log(`Reservation is overlapping: ${isOverlapping}`);
    const dev = isWithinRoleDuration;
    //const dev = false;
    if (!dev) {
        console.log(`Booking with uniqueId ${reservation.uniqueId}, name: ${reservation.name.displayName} already exists for hunting spot ${reservation.huntingSpot}. Not inserting.`);
        const message = LocaleManager.translate("insertBooking.isWithinRoleDuration",{prop: `${reservation.roleDuration / 60}`,prop2:`${reservation.huntingSpot}`});
        throw new Error(message);
    } else if (isOverlapping) {
        console.log(`Overlapping reservation found!`);
        const message = LocaleManager.translate("insertBooking.isOverlapping",{prop: `${reservation.huntingSpot}`});
        throw new Error(message);
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
        console.log(`Booking inserted successfully.`);
    }
};

export const getCurrentBookingsForUserId = async (collectionName: string | undefined, userId: string, databaseId: string) => {
    const formattedArray: { formattedString: string; reservation: IBooking }[] = [];

    if (collectionName === undefined) return formattedArray;
    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>("booking", BookingSchema, collectionName);

    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        BookingModel = REFUGIADB.model<IBooking>("booking", BookingSchema, collectionName);
    } else {

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

    console.log(`${result.length} bookings for userId: ${userId} found.`);
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

        BookingModel = REFUGIADB.model<IBooking>("booking", BookingSchema, collectionName);
    } else {

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

    const updateResult = await BookingModel.updateOne(
        {_id: {$in: bookingToDelete?._id}},
        {$set: {deletedAt: dayjs()}}
    );

    // await BookingModel.deleteOne({
    //     uniqueId: userId,
    //     deletedAt: null,
    //     huntingSpot: huntingSpot,
    //     start: start,
    //     end: end
    // });

    console.log(`Bookings for userId: ${userId} on spot: ${huntingSpot} deleted.`);

};

export const getAllCollectionsAndValues = async (databaseId: string): Promise<DatabaseResult> => {

    const result: DatabaseResult = {};


    let db;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        db = GODSDB.db;
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        db = REFUGIADB.db;
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }


    // List all collections in the database
    const collections = await db.listCollections().toArray();
    const filteredCollections = collections.filter((e) => e.name !== 'statisticsForUsers');
    const names = filteredCollections.map((e) => `${e.name}`);

    console.log(`Found ${filteredCollections.length} collections: [${names}]`);

    // Iterate over collections
    for (const collection of filteredCollections) {
        const collectionName = collection.name;

        result[collectionName] = await db
            .collection<IBooking>(collectionName)
            .find({deletedAt: null})
            .toArray();
        //console.log(`Collection: ${collectionName}`);
    }
    //console.log("=========================", result);
    console.log("DONE! getting all collections and documents");
    return result; // Return the result object with collections and documents

};

export const getResultForSummary = async (databaseId: string) => {

    let db;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        db = GODSDB.db;
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        db = REFUGIADB.db;
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    const result: DatabaseResultForSummary = {};

    const collections = await db.listCollections().toArray();
    const filteredCollections = collections.filter((e) => e.name !== 'statisticsForUsers');
    const names = filteredCollections.map((e) => `${e.name}`);

    console.log(`Found ${collections.length} collections: [${names}]`);
    for (const collection of filteredCollections) {
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
    console.log("DONE! Getting summary collections and values");
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
        console.log(`Collection '${collection}' not found.`);
        return result;
    }
    const names = collections.map((e) => `${e.name}`);

    console.log(`Found ${collections.length} collections: [${names}]`);
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
    console.log("DONE! Getting grouped collections and values");
    return result;
};

export const createOrUpdateStatistics = async (interaction: ChatInputCommandInteraction, commandName: string, databaseId: string) => {
    let StatisticsModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        StatisticsModel = GODSDB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        StatisticsModel = REFUGIADB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    const userId = interaction.user.id;
    const huntingSpot = interaction.channel as TextChannel
    const spot = interaction.options.getString("spot")!;


    //console.log("<<<<<<<<<<<<<<<<<<<<<<<huntingspot", huntingSpot.name);
    //console.log("<<<<<<<<<<<<<<<<<<<<<<<spot", spot);

    const existingDocument = await StatisticsModel.findOne({
        userId,
    });

    if (existingDocument) {

        const result = await StatisticsModel.findOneAndUpdate(
            {
                userId,
            },
            {
                $inc: {
                    [`commandsCount.${commandName}`]: 1,
                    [`huntingPlaces.${huntingSpot.name}.${spot}`]: 1,
                },
            },
            // Set 'new' option to true to return the updated document
            {new: true}
        );
        console.log(`Statistic updated successfully.`);
    } else {

        const result = await StatisticsModel.create({
            userId,
            commandsCount: {[commandName]: 1},
            huntingPlaces: {[huntingSpot.name]: {[spot]: 1}},
            name: {
                interactionName: interaction.user.username,
                displayName: interaction.user.displayName,
                globalName: interaction.user.globalName
            }
        });
        console.log(`New Statistic created successfully.`);
    }
};
export const getDataForUserStatistics = async (interaction: ChatInputCommandInteraction, userId: string, databaseId: string): Promise<{
    spot: string;
    amount: number
}[]> => {
    const formattedArray: { spot: string; amount: number }[] = [];
    let StatisticsModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        StatisticsModel = GODSDB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        StatisticsModel = REFUGIADB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }

    const result = await StatisticsModel.findOne({
        userId,
    });

    if (result) {
        for (const [outerKey, outerValue] of result.huntingPlaces.entries()) {
            // console.log(`Outer Key: ${outerKey}`);

            let sumOfInnerValues = 0;

            for (const [innerKey, innerValue] of outerValue.entries()) {
                // console.log(`Inner Key: ${innerKey}, Inner Value: ${innerValue}`);

                sumOfInnerValues += innerValue;
            }

            formattedArray.push({spot: outerKey, amount: sumOfInnerValues});
        }
    }
    //console.log(formattedArray);
    console.log(`CommandExecution updated successfully.`);
    return formattedArray;
};

function mapToObject(map: Map<string, Map<string, number>>): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};

    map.forEach((innerMap, outerKey) => {
        const innerObject: Record<string, number> = {};
        innerMap.forEach((value, innerKey) => {
            innerObject[innerKey] = value;
        });
        result[outerKey] = innerObject;
    });

    return result;
}

export const getDataForHuntingPlaceStatistics = async (interaction: ChatInputCommandInteraction, databaseId: string): Promise<IStatistics[]> => {
    let StatisticsModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        StatisticsModel = GODSDB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        StatisticsModel = REFUGIADB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    const statistics: IStatistics[] = [];
    const allStatistics = await StatisticsModel.find({});
    if (allStatistics) {
        statistics.push(...allStatistics);
    }

    console.log(`CommandExecution updated successfully.`);
    return statistics;
};
// export const getDeletedBookingsForUserId = async (collectionName: string, userId: string, databaseId: string) => {
//     let StatisticsModel;
//     if (databaseId === process.env.GUILDSERVER_GODS) {
//         StatisticsModel = GODSDB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
//
//     } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
//         // Example: Connect to another database
//         StatisticsModel = REFUGIADB.model<IStatistics>("statistics", StatisticsSchema, "statisticsForUsers");
//     } else {
//         // Handle the case where the database ID is not recognized
//         throw new Error(`Unknown database ID: ${databaseId}`);
//     }
//
//     //console.log(bookings.map((e) => e.uniqueId));
//     const result = await StatisticsModel.find({uniqueId: userId, deletedAt: {$ne: null}}).sort({
//         deletedAt: 1,
//     });
//
//
//     logger.info(`Statistics for userId: ${userId} found.`);
//     return result;
// };


