import {Schema} from "mongoose";
import {Reclaim} from "../types";
import NamesSchema from "./Names";

const ReclaimSchema = new Schema<Reclaim>({
        isReclaim: {type: Boolean, required: true, default: false},
        reclaimId: {type: String, required: true, default: null},
        reclaimedBy: {type: NamesSchema, required: true, default: null},
        reclaimedAt: {type: Date, required: true, default: null},
        reclaimedMessage: {type: String, required: true, default: null},
    },
);
export default ReclaimSchema;