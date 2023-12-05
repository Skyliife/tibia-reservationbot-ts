import { EmbedBuilder, bold, inlineCode, quote, time } from "discord.js";
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
        text: `Made with ❤️ by Gods version 0.0.3-beta.0`,
        iconURL: "https://static.tibia.com/images/community/default_logo.gif",
      });
      embeds.push(embed);
    }
  }

  return embeds;
};

export const createEmbedsForGroups = async (channel: string | undefined) => {
  const data: DatabaseResultForGroup = await getResultForGroups(channel);
  console.log("DATAHere", data);

  const embeds: EmbedBuilder[] = [];
  for (const collectionName in data) {
    if (data.hasOwnProperty(collectionName)) {
      const huntingSpawns = data[collectionName];
      for (const huntingSpawn in huntingSpawns) {
        const embed = new EmbedBuilder();

        embed.setTitle(`${huntingSpawn}`);

        const bookings = huntingSpawns[huntingSpawn];
        for (const booking in bookings) {
          let value: string = "";
          const bookingsList = bookings[booking];
          //append bookings.startAt and booking.name with \n
          for (const booking of bookingsList) {
            // prettier-ignore
            const datePart = `${dayjs(booking.start).format("D.M")}`;
            // prettier-ignore
            const timePart = `${dayjs(booking.start).format("HH:mm")}-${dayjs(booking.end).format("HH:mm")}`;
            // prettier-ignore
            const namePart = `${booking.name} ${time(dayjs(booking.createdAt).toDate(),"R")}`;

            value += `${bold(timePart)} : ${namePart} \n`;
          }

          const ss = dayjs(booking);
          const nss = dayjs(ss).add(1, "day");

          const fieldName = `${ss.format("D.M")} to ${nss.format("D.M")}`;
          embed.addFields({
            name: fieldName,
            value: value,
            inline: false,
          });
        }
        console.log("EMBEEEEEED", embed);
        embeds.push(embed);
      }
    }
  }
  if (embeds.length > 0) {
    const lastEmbed = embeds[embeds.length - 1];
    lastEmbed.setFooter({
      text: `Made with ❤️ by Gods version 0.0.3-beta.0`,
      // iconURL: "https://static.tibia.com/images/community/default_logo.gif",
    });
  }

  return embeds;
};

//main();

async function main() {
  //await createEmbedsForGroups();
}
