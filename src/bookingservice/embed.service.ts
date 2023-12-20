import {AttachmentBuilder, bold, EmbedBuilder} from "discord.js";
import {getResultForGroups} from "./database.service";
import {DatabaseResultForGroup, Name} from "../types";
import * as fs from "fs";
import dayjs from "dayjs";
import {isCurrentTimeAfter10AM, isCurrentTimeBefore10AM, isCurrentTimeBeforeMidnight} from "../utils";

// export const createEmbedsForSummary = async () => {
//     const data: DatabaseResultForSummary = await getResultForSummary();
//     //console.log("DATA", data);
//
//     const embeds: EmbedBuilder[] = [];
//     for (const collectionName in data) {
//         if (data.hasOwnProperty(collectionName)) {
//             const embed = new EmbedBuilder();
//
//             embed.setTitle(`Hunting Places in ${collectionName}`);
//
//             for (const huntingSpawn in data[collectionName]) {
//                 let value: string = "";
//                 const bookings = data[collectionName][huntingSpawn];
//                 for (const booking of bookings) {
//                     //append bookings.startAt and booking.name with \n
//                     // prettier-ignore
//                     const datePart = `${dayjs(booking.start).format("D.M")}`;
//                     // prettier-ignore
//                     const timePart = `${dayjs(booking.start).format("HH:mm")}-${dayjs(booking.end).format("HH:mm")}`;
//                     // prettier-ignore
//                     const namePart = `${booking.name} ${time(dayjs(booking.createdAt).toDate(), "R")}`;
//
//                     value += `${datePart} ${bold(timePart)} by ${namePart} \n`;
//                 }
//
//                 embed.addFields({
//                     name: huntingSpawn,
//                     value: value,
//                     inline: true,
//                 });
//             }
//
//             embed.setFooter({
//                 text: `Made with ❤️ by Gods version 0.0.3-beta.0`,
//                 iconURL: "https://static.tibia.com/images/community/default_logo.gif",
//             });
//             embeds.push(embed);
//         }
//     }
//
//     return embeds;
// };


export const createEmbedsForGroups = async (channel: string | undefined, databaseId: string) => {
    const data: DatabaseResultForGroup = await getResultForGroups(channel, databaseId);
    //console.log("DATAHere", data);

    const embeds: { embed: EmbedBuilder; attachment: AttachmentBuilder }[] = [];
    for (const collectionName in data) {
        if (data.hasOwnProperty(collectionName)) {
            const huntingPlaces = data[collectionName];
            for (const huntingPlace in huntingPlaces) {
                const embed = new EmbedBuilder();
                let totalDuration = 0;
                //Title
                embed.setTitle(`${huntingPlace}`);

                const huntingSpots = huntingPlaces[huntingPlace];
                for (const huntingspot in huntingSpots) {
                    let value: string = "";
                    const bookingsList = huntingSpots[huntingspot];
                    //append bookings.startAt and booking.name with \n
                    for (const booking of bookingsList) {

                        const durationMinutes = dayjs(booking.end).diff(dayjs(booking.start), "minute");
                        totalDuration += durationMinutes;

                        const timePart = `${dayjs(booking.start).format("HH:mm")}-${dayjs(booking.end).format("HH:mm")}`;

                        let namePart = createNamePart(booking.name);

                        value += `${bold(timePart)} : ${namePart}\n`;
                    }
                    const ss = dayjs(huntingspot);
                    const ssn = dayjs(ss).add(1, "day");

                    //Fields
                    const fieldName = `Date ${ss.format("D")}-${ssn.format("D.MM")} SS`;
                    createFields(value, embed, fieldName);

                }
                createColor(embed, totalDuration);

                //Thumbnail
                const embedWithThumbnail = await addThumbnail(embed, huntingPlace);
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
            text: `Made with ❤️ by Gods version 1.0.3`
        });
    }

    return embeds;
};

function createNamePart(names: Name) {

    if (names.userInputName && names.userInputName !== "") {
        return `${names.userInputName}`;

    }
    if (names.guildNickName && names.guildNickName !== "") {
        return `${names.guildNickName}`

    }
    return `${names.displayName}`;
}

//main();
function createColor(embed: EmbedBuilder, totalDuration: number) {

    const startTime = dayjs();
    const temp = dayjs()
    let endTime;

    if (isCurrentTimeBeforeMidnight(startTime) && isCurrentTimeAfter10AM(startTime)) {
        endTime = temp.add(2, "day").set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    } else if (isCurrentTimeBefore10AM(startTime)) {
        endTime = temp.add(1, "day").set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    } else {
        endTime = temp;
    }
    const totalAvailableTime = endTime.diff(startTime, 'minutes');

    const percentageBooked = Math.round((totalDuration / totalAvailableTime) * 100);

    embed.setColor(0x00FF00);
    if (percentageBooked > 33 && percentageBooked <= 66) {
        embed.setColor(0xFFFF00);
    } else if (percentageBooked > 66) {
        embed.setColor(0xFF0000);
    }
}

const addThumbnail = async (embed: EmbedBuilder, name: string) => {
    const formatname = name.replace(/\s+/g, "").toLowerCase();
    const filename = `${formatname}.gif`;
    const filepath = `../tibia-reservationbot-ts/build/huntingplaces/thumbnails/${filename}`;
    if (fs.existsSync(filepath)) {
        // File exists, create AttachmentBuilder with the specified file
        const file = new AttachmentBuilder(filepath);
        embed.setThumbnail(`attachment://${filename}`);
        return {embed: embed, attachment: file};
    } else {
        // File doesn't exist, use a fallback (default.gif)
        const filename = `default.gif`;
        const fallbackFilePath = `../tibia-reservationbot-ts/build/huntingplaces/thumbnails/${filename}`;
        const fallbackFile = new AttachmentBuilder(fallbackFilePath);
        embed.setThumbnail(`attachment://${filename}`);
        return {embed: embed, attachment: fallbackFile};
    }
};

function createFields(value: string, embed: EmbedBuilder, fieldName: string) {
    if (value.length <= 1024) {
        embed.addFields({
            name: fieldName,
            value: value,
            inline: true,
        });
    } else {
        const x = splitStringIntoChunks(value, 1024);
        if (x.length < 3) {
            embed.addFields(
                {
                    name: fieldName,
                    value: x[0],
                    inline: true,
                },
                {
                    name: fieldName,
                    value: x[1],
                    inline: true,
                }
            );
        } else if (x.length < 4) {
            embed.addFields(
                {
                    name: fieldName,
                    value: x[0],
                    inline: true,
                },
                {
                    name: fieldName,
                    value: x[1],
                    inline: true,
                },
                {
                    name: fieldName,
                    value: x[2],
                    inline: true,
                }
            );
        }
    }
}

function splitStringIntoChunks(inputString: string, maxCharacters: number) {
    const lines = inputString.split("\n");
    const resultArray = [];
    let currentChunk = "";

    for (const line of lines) {
        const lineWithNewline = line + "\n";

        if ((currentChunk + lineWithNewline).length <= maxCharacters) {
            currentChunk += lineWithNewline;
        } else {
            resultArray.push(currentChunk);
            currentChunk = lineWithNewline;
        }
    }

    if (currentChunk.length > 0) {
        resultArray.push(currentChunk);
    }

    return resultArray;
}
