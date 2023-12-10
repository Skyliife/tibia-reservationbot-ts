import mongoose from "mongoose";
import logger from "../logging/logger";

module.exports = () => {

    // const DBNAME = encodeURIComponent(process.env.DBNAME);
    // const DBUSER = encodeURIComponent(process.env.DBUSER);
    // const DBPASS = encodeURIComponent(process.env.DBPASS);
    // const MONGO_URI = `mongodb://${DBUSER}:${DBPASS}@vmi1535787.contaboserver.net/${DBNAME}?authMechanism=DEFAULT&authSource=${DBNAME}`
    const MONGO_URI = process.env.DBURI
    if (!MONGO_URI) return logger.info(`Mongo URI not found, skipping.`);
    mongoose.pluralize(null);

    mongoose
        .connect(MONGO_URI)
        .then(() => logger.info(`MongoDB connection has been established.`))
        .catch((error) => {
            logger.error(`MongoDB connection has been failed.`);
            console.log(error)
            throw new Error("MongoDB connection has been failed.");
        });
};
