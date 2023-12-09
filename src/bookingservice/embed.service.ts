import { AttachmentBuilder, EmbedBuilder, bold, time, userMention } from "discord.js";
import { getResultForGroups, getResultForSummary } from "./database.service";
import { DatabaseResultForGroup, DatabaseResultForSummary } from "../types";
import * as fs from "fs";
import path from "path";
import dayjs from "dayjs";

export const createEmbedsForSummary = async () => {
  const data: DatabaseResultForSummary = await getResultForSummary();
  //console.log("DATA", data);

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
  //console.log("DATAHere", data);

  const embeds: { embed: EmbedBuilder; attachment: AttachmentBuilder }[] = [];
  for (const collectionName in data) {
    if (data.hasOwnProperty(collectionName)) {
      const huntingSpawns = data[collectionName];
      for (const huntingSpawn in huntingSpawns) {
        const embed = new EmbedBuilder();

        //Title
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
            let namePart

            //console.log(booking.name);
            namePart = `${booking.name}/${userMention(booking.uniqueId)} ${time(
              dayjs(booking.createdAt).toDate(),
              "R"
            )}`;
            if (booking.name === "default") {
              namePart = `${userMention(booking.uniqueId)} ${time(
                dayjs(booking.createdAt).toDate(),
                "R"
              )}`;
            }

            value += `${bold(timePart)} : ${namePart} \n`;
          }

          const ss = dayjs(booking);
          //const nss = dayjs(ss).add(1, "day");

          //Fields
          const fieldName = `Date ${ss.format("D.M.YY")}`;
          embed.addFields(
            {
              name: fieldName,
              value: value,
              inline: false,
            }
          );
        }

        //Thumbnail
        const embedWithThumbnail = await addThumbnail(embed, huntingSpawn);

        //console.log("EMBEEEEEED", embedWithThumbnail);
        embeds.push(embedWithThumbnail);
      }
    }
  }
  // add Header to first embed
  if (embeds.length > 0) {
    const lastEmbed = embeds[0].embed;
    lastEmbed.setAuthor({
      name: `Current and upcoming hunts. Times are in Europe / Berlin`,
    });
  }
  //add Footer to last embed
  if (embeds.length > 0) {
    const lastEmbed = embeds[embeds.length - 1].embed;
    lastEmbed.setFooter({
      text: `Made with ❤️ by Gods version 0.0.3-beta.0`,
      // iconURL: "https://static.tibia.com/images/community/default_logo.gif",
    });
  }

  return embeds;
};

//main();

const addThumbnail = async (embed: EmbedBuilder, name: string) => {
  const formatname = name.replace(/\s+/g, "").toLowerCase();
  const filename = `${formatname}.gif`;
  const filepath = `../tibia-reservationbot-ts/build/huntingplaces/thumbnails/${filename}`;
  if (fs.existsSync(filepath)) {
    // File exists, create AttachmentBuilder with the specified file
    const file = new AttachmentBuilder(filepath);
    embed.setThumbnail(`attachment://${filename}`);
    return { embed: embed, attachment: file };
  } else {
    // File doesn't exist, use a fallback (default.gif)
    const filename = `default.gif`;
    const fallbackFilePath = `../tibia-reservationbot-ts/build/huntingplaces/thumbnails/${filename}`;
    const fallbackFile = new AttachmentBuilder(fallbackFilePath);
    embed.setThumbnail(`attachment://${filename}`);
    return { embed: embed, attachment: fallbackFile };
  }
};

async function main() {
  //await createEmbedsForGroups();
}
