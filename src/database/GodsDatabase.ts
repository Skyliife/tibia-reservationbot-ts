import mongoose from "mongoose";

const MONGO_URI = process.env.DBURI_GODS
mongoose.pluralize(null);

export const GODSDB = mongoose.createConnection(MONGO_URI);
console.log(`Connected to GodsDB.`);
