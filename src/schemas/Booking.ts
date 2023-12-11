import {Schema} from "mongoose";
import {IBooking} from "../types";
import NamesSchema from "./Names";

const BookingSchema = new Schema<IBooking>({
        huntingPlace: {type: String, required: true},
        huntingSpot: {type: String, required: true},
        name: {type: NamesSchema, required: true},
        uniqueId: {type: String, required: true},
        serverSaveStart: {type: Date, required: true},
        serverSaveEnd: {type: Date, required: true},
        start: {type: Date, required: true},
        end: {type: Date, required: true},
        createdAt: {type: Date, required: true},
        deletedAt: {type: Date, default: null},
        displaySlot: {type: Date, required: true},
    },
).index({end: 1}, {expireAfterSeconds: 0});

export default BookingSchema;
