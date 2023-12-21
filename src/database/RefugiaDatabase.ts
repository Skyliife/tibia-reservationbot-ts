import mongoose from "mongoose";

const MONGO_URI = process.env.DBURI_REFUGIA
mongoose.pluralize(null);

export const REFUGIADB = mongoose.createConnection(MONGO_URI);
console.log(`Connected to RefugiaDB.`);
