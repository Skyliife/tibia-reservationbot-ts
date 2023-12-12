import mongoose from "mongoose";
import logger from "../logging/logger";


// const DBNAME = encodeURIComponent(process.env.DBNAME);
// const DBUSER = encodeURIComponent(process.env.DBUSER);
// const DBPASS = encodeURIComponent(process.env.DBPASS);
// const MONGO_URI = `mongodb://${DBUSER}:${DBPASS}@vmi1535787.contaboserver.net/${DBNAME}?authMechanism=DEFAULT&authSource=${DBNAME}`
const MONGO_URI = process.env.DBURI


mongoose.pluralize(null);

export const GODSDB = mongoose.createConnection(MONGO_URI);
logger.info(`Connected to GodsDB.`);
