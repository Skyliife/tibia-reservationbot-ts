import {Schema} from "mongoose";
import {Name} from "../types";

const NamesSchema = new Schema<Name>({
        userInputName: {type: String, required: false},
        displayName: {type: String, required: true},
        guildNickName: {type: String, required: false},
        interactionName: {type: String, required: true},
    },
);

export default NamesSchema;