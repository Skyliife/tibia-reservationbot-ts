import {
  EmbedBuilder,
  EmbedData,
  bold,
  inlineCode,
  quote,
  time,
} from "discord.js";
import { getResultForGroups, getResultForSummary } from "./database.service";
import { DatabaseResultForGroup, DatabaseResultForSummary } from "../types";
import dayjs from "dayjs";

export const createEmbedsForSummary = async () => {
  const data: DatabaseResultForSummary = await getResultForSummary();
  console.log("DATA", data);

  const embeds: EmbedBuilder[] = [];
  for (const collectionName in data) {
    if (data.hasOwnProperty(collectionName)) {
      const embed = new EmbedBuilder();

      embed.setTitle(`Hunting Places in ${collectionName}`);

      for (const huntingSpawn in data[collectionName]) {
        let value: string = "";
        const bookings = data[collectionName][huntingSpawn];
        for (const booking of bookings) {
          //append bookings.startAt and booking.name with \n
          // prettier-ignore
          const datePart = `${dayjs(booking.start).format("D.M")}`;
          // prettier-ignore
          const timePart = `${dayjs(booking.start).format("HH:mm")}-${dayjs(booking.end).format("HH:mm")}`;
          // prettier-ignore
          const namePart = `${booking.name} ${time(dayjs(booking.createdAt).toDate(),"R")}`;

          value += `${datePart} ${bold(timePart)} by ${namePart} \n`;
        }

        embed.addFields({
          name: huntingSpawn,
          value: value,
          inline: true,
        });
      }
      const date = new Date();
      embed.setFooter({
        text: `Made with ❤️ by Gods last updated: ${time(date, "R")}`,
        iconURL: "https://static.tibia.com/images/community/default_logo.gif",
      });
      embeds.push(embed);
    }
  }

  return embeds;
};

// export const createEmbedsForGroups = async () => {
//   const data: DatabaseResultForGroup = await getResultForGroups();
//   console.log("DATA", data);

//   const embeds: EmbedBuilder[] = [];
//   for (const collectionName in data) {
//     if (data.hasOwnProperty(collectionName)) {
//       const embed = new EmbedBuilder();

//       embed.setTitle(`Hunting Places in ${collectionName}`);

//       for (const huntingSpawn in data[collectionName]) {
//         let value: string = "";
//         const bookings = data[collectionName][huntingSpawn];
//         for (const booking of bookings) {
//           //append bookings.startAt and booking.name with \n
//           // prettier-ignore
//           const datePart = `${dayjs(booking.start).format("D.M")}`;
//           // prettier-ignore
//           const timePart = `${dayjs(booking.start).format("HH:mm")}-${dayjs(booking.end).format("HH:mm")}`;
//           // prettier-ignore
//           const namePart = `${booking.name} ${time(dayjs(booking.createdAt).toDate(),"R")}`;

//           value += `${datePart} ${bold(timePart)} by ${namePart} \n`;
//         }

//         embed.addFields({
//           name: huntingSpawn,
//           value: value,
//           inline: true,
//         });
//       }
//       const date = new Date();
//       embed.setFooter({
//         text: `Made with ❤️ by Gods last updated: ${time(date, "R")}`,
//         iconURL: "https://static.tibia.com/images/community/default_logo.gif",
//       });
//       embeds.push(embed);
//     }
//   }

//   return embeds;
// };
