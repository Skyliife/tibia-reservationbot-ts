import mongoose from "mongoose";

module.exports = () => {
  const MONGO_URI = process.env.DBURI;
  if (!MONGO_URI) return console.log(`Mongo URI not found, skipping.`);
  mongoose
    .connect(`${MONGO_URI}/${process.env.DBNAME}`)
    .then(() => console.log(`MongoDB connection has been established.`))

    .catch(() => console.log(`MongoDB connection has been failed.`));
};
