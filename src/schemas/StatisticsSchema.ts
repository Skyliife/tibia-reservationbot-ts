import {Schema} from "mongoose";
import {IStatistics} from "../types";
import NamesSchema from "./Names";

const StatisticsSchema = new Schema<IStatistics>({
    userId: {type: String, required: true},
    name: {type: NamesSchema, required: true},
    commandsCount: {type: Map, of: Number, default: {}},
    huntingPlaces: {type: Map, of: Map, default: {}},
});

export default StatisticsSchema;