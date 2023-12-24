import BookingSchema from "../schemas/Booking";
import Booking from "./booking";

import {DatabaseResult, DatabaseResultForGroup, DatabaseResultForSummary, IBooking, IStatistics, Name} from "../types";
import dayjs, {Dayjs} from "dayjs";
import {REFUGIADB} from "../database/RefugiaDatabase";
import {GODSDB} from "../database/GodsDatabase";
import {ChatInputCommandInteraction, TextChannel} from "discord.js";
import StatisticsSchema from "../schemas/StatisticsSchema";
import LocaleManager from "../locale/LocaleManager";
import mongoose from "mongoose";

//how to add a reservation to different databases?

export class DatabaseService {

    private Database;

    constructor(databaseId: string) {

        if (databaseId === process.env.GUILDSERVER_GODS) {
            this.Database = GODSDB;
        } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {
            this.Database = REFUGIADB;
        } else {
            throw new Error(`Unknown database ID: ${databaseId}`);
        }
    }

    public async tryAddBooking(reservation: Booking) {
        //Create Model to get Data
        const BookingModel = this.Database.model<IBooking>(reservation.huntingPlace, BookingSchema);
        //Get Required Data
        const existingReservationsForID = await BookingModel.find({
            huntingSpot: reservation.huntingSpot,
            uniqueId: reservation.uniqueId,
            deletedAt: null,
            displaySlot: reservation.displaySlot,
        });
        const existingReservationsForHuntingSpot = await BookingModel.find({
            huntingSpot: reservation.huntingSpot,
            deletedAt: null,
        });
        //Check if the user has already 4 reservations for the same hunting spot
        this.validateReservationCount(existingReservationsForID, reservation.huntingSpot);
        //Check if the user has already reached the time limit for booking e.g. 2 hours for Verified/Vip and 3 hours for Gods
        this.areAllCurrentReservationsFromUserWithinRoleDuration(reservation.roleDuration, reservation, existingReservationsForID);
        //Check if the reservation is overlapping with other reservations
        this.validateOverlap(reservation, existingReservationsForHuntingSpot);
        //Finally insert the reservation
        const newBooking = new BookingModel(reservation);
        await newBooking.save();
        console.log(`Booking inserted successfully.`);
    };

    public async tryDeleteBooking(collectionName: string, huntingSpot: string, userId: string, start: Dayjs, end: Dayjs) {

        const BookingModel = this.Database.model<IBooking>(collectionName, BookingSchema);

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

        await BookingModel.updateOne({_id: {$in: bookingToDelete?._id}}, {$set: {deletedAt: dayjs()}});

        console.log(`Bookings for userId: ${userId} on spot: ${huntingSpot} deleted.`);
    };

    public async tryReclaimBooking(collectionName: string, reservationToClaim: IBooking, Reclaim: any) {

        const BookingModel = this.Database.model<IBooking>(collectionName, BookingSchema);

        const bookingToReclaim = await BookingModel.findOne({
            uniqueId: reservationToClaim.uniqueId,
            deletedAt: null,
            huntingSpot: reservationToClaim.huntingSpot,
            start: reservationToClaim.start,
            end: reservationToClaim.end
        });
        if (!bookingToReclaim) {
            throw new Error("No matching booking found for reclaim");
        }
        await BookingModel.updateOne({_id: {$in: bookingToReclaim?._id}}, {$set: {Reclaim: Reclaim}});

        console.log(`Bookings reclaimed`);
    };

    public async getAllCollectionsAndValues(): Promise<DatabaseResult> {
        const db = this.Database.db;
        const result: DatabaseResult = {};

        // List all collections in the database
        const collections = await db.listCollections().toArray();
        const filteredCollections = await this.getFilteredCollections(db);


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

    public async getResultForSummary(databaseId: string) {
        const db = this.Database.db;
        const result: DatabaseResultForSummary = {};
        // List all collections in the database
        const filteredCollections = await this.getFilteredCollections(db);


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

    public async getResultForGroups(collection: string) {
        const db = this.Database.db;
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

                const sortedResult: Record<string, IBooking[]> = {};
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


    public async createOrUpdateStatistics(interaction: ChatInputCommandInteraction, commandName: string) {
        const StatisticsModel = this.Database.model<IStatistics>("statisticsForUsers", StatisticsSchema);

        const userId = interaction.user.id;
        const huntingSpot = interaction.channel as TextChannel
        const spot = interaction.options.getString("spot")!;

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

    public async getDataForUserStatistics(interaction: ChatInputCommandInteraction, userId: string) {
        const formattedArray: { spot: string; amount: number }[] = [];
        const StatisticsModel = this.Database.model<IStatistics>("statisticsForUsers", StatisticsSchema);

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

    private async getFilteredCollections(db: mongoose.mongo.Db) {
        const collections = await db.listCollections().toArray();
        const filteredCollections = collections.filter((e) => e.name !== 'statisticsForUsers');
        const names = filteredCollections.map((e) => `${e.name}`);
        console.log(`Found ${filteredCollections.length} collections: [${names}]`);
        return filteredCollections;
    }

    private validateReservationCount(existingReservations: IBooking[], huntingSpot: string) {
        if (existingReservations.length >= 4) {
            const message = LocaleManager.translate("insertBooking", {prop: `${huntingSpot}`});
            throw new Error(message);
        }
    }

    private validateOverlap(reservation: Booking, existingReservationsForHuntingSpot: IBooking[]) {
        const isOverlapping = this.isCurrentReservationOverlappingWithExistingReservations(reservation, existingReservationsForHuntingSpot);
        if (isOverlapping) {
            console.log(`Overlapping reservation found!`);
            const message = LocaleManager.translate("insertBooking.isOverlapping", {prop: `${reservation.huntingSpot}`});
            throw new Error(message);
        }
    }

    private areAllCurrentReservationsFromUserWithinRoleDuration = (roleDuration: number, currentReservation: Booking, existingReservations: IBooking[]) => {
        //console.log(roleDuration);
        const durationInMilliseconds = dayjs.duration(roleDuration, "minutes").asMilliseconds();
        const currentReservationDuration = dayjs(currentReservation.end).diff(dayjs(currentReservation.start), "millisecond");
        //collect the duration of all reservations from user
        const durationOfAllReservationsFromUser = existingReservations.reduce(
            (accumulator, reservation) => accumulator + dayjs(reservation.end).diff(dayjs(reservation.start), "millisecond"),
            0,
        );
        const isWithinDuration = durationOfAllReservationsFromUser + currentReservationDuration <= durationInMilliseconds
        if (!isWithinDuration) {

            console.log(`Booking with uniqueId ${currentReservation.uniqueId}, name: ${currentReservation.name.displayName} already exists for hunting spot ${currentReservation.huntingSpot}. Not inserting.`);
            const message = LocaleManager.translate("insertBooking.isWithinRoleDuration", {
                prop: `${currentReservation.roleDuration / 60}`,
                prop2: `${currentReservation.huntingSpot}`
            });
            throw new Error(message);
        }
    };

    private isCurrentReservationOverlappingWithExistingReservations(newReservation: Booking, existingReservations: IBooking[]) {
        const newReservationStart = dayjs(newReservation.start);
        const newReservationEnd = dayjs(newReservation.end);

        return existingReservations.some((existingReservation) => {
            const existingReservationStart = dayjs(existingReservation.start);
            const existingReservationEnd = dayjs(existingReservation.end);

            return (
                newReservationStart.isBetween(existingReservationStart, existingReservationEnd, null, "[)") ||
                newReservationEnd.isBetween(existingReservationStart, existingReservationEnd, null, "(]") ||
                existingReservationStart.isBetween(newReservationStart, newReservationEnd, null, "[)") ||
                existingReservationEnd.isBetween(newReservationStart, newReservationEnd, null, "(]")
            );
        });
    }
}

export const getCurrentBookingsForUserId = async (collectionName: string | undefined, userId: string, databaseId: string) => {
    const formattedArray: { formattedString: string; reservation: IBooking }[] = [];

    if (collectionName === undefined) return formattedArray;
    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>(collectionName, BookingSchema);

    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        BookingModel = REFUGIADB.model<IBooking>(collectionName, BookingSchema);
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

export const getBookingsToReclaim = async (collectionName: string | undefined, userId: string, databaseId: string): Promise<{
    formattedString: string;
    reservationToClaim: IBooking
}[]> => {
    const formattedArray: { formattedString: string; reservationToClaim: IBooking }[] = [];

    if (collectionName === undefined) return formattedArray;
    let BookingModel;
    if (databaseId === process.env.GUILDSERVER_GODS) {
        BookingModel = GODSDB.model<IBooking>(collectionName, BookingSchema);

    } else if (databaseId === process.env.GUILDSERVER_REFUGIA) {

        BookingModel = REFUGIADB.model<IBooking>(collectionName, BookingSchema);
    } else {

        throw new Error(`Unknown database ID: ${databaseId}`);
    }
    const referenceTime = dayjs().subtract(15, 'minutes');


    const result = await BookingModel.find({
        deletedAt: null,
        uniqueId: {$ne: userId},
        start: {$lt: referenceTime},
        reclaim: null
    }).sort({
        start: 1,
    });
    result.forEach((item) => {
        const {huntingPlace, huntingSpot, start, end, name} = item;
        const namePart = getName(name);
        const formattedString = `Reclaim ${dayjs(start).format("HH:mm")} - ${dayjs(end).format("HH:mm")} ${namePart}`;
        formattedArray.push({formattedString: formattedString, reservationToClaim: item});
    })

    console.log(`${result.length} bookings to reclaim found.`);
    return formattedArray;
};

const getName = (names: Name) => {

    if (names.userInputName && names.userInputName !== "") {
        return `${names.userInputName}`;

    }
    if (names.guildNickName && names.guildNickName !== "") {
        return `${names.guildNickName}`

    }
    return `${names.displayName}`;
}

