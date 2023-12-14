import {Schema} from "mongoose";
import {ICommandExecution} from "../types";

const CommandExecutionSchema = new Schema<ICommandExecution>({
    userId: {type: String, required: true},
    huntingPlaces: { type: Map, of: Map, default: {} },
    commandName: {type: String, required: true},
    executionCount: {type: Number, default: 0},
});

export default CommandExecutionSchema;