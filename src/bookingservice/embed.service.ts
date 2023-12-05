import { EmbedBuilder, EmbedData } from "discord.js";
import {
  getAllCollectionsAndValues,
  getGroupedCollectionsAndValues,
} from "./database.service";

export const createEmbeds = async () => {
  const data = await getAllCollectionsAndValues();
  const data2 = await getGroupedCollectionsAndValues();
  console.log("DATA2", data2);

  const embeds: EmbedBuilder[] = [];
  for (const collectionName in data) {
    const embed = new EmbedBuilder().setTitle(
      `Bookings for ${data[collectionName].forEach((e) => e.huntingSpot)}`
    );
    embeds.push(embed);
    if (Object.prototype.hasOwnProperty.call(data, collectionName)) {
      const collectionValues = data[collectionName];
      //console.log(`Collection: ${collectionName}`);
      for (const value of collectionValues) {
        //console.log(value);
      }
    }
  }
  return embeds;
};
