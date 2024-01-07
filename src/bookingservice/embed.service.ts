import {AttachmentBuilder, bold, EmbedBuilder, strikethrough} from "discord.js";
import {DatabaseResultForGroup, IBooking, Name} from "../types";
import * as fs from "fs";
import dayjs from "dayjs";
import {isCurrentTimeAfter10AM, isCurrentTimeBefore10AM, isCurrentTimeBeforeMidnight} from "../utils";

export class EmbedService {

    constructor() {
    }

    createEmbedsForGroups = async (data: DatabaseResultForGroup) => {
        const embeds: { embed: EmbedBuilder; attachment: AttachmentBuilder }[] = [];
        for (const collectionName in data) {
            if (data.hasOwnProperty(collectionName)) {
                const huntingPlaces = data[collectionName];
                for (const huntingPlace in huntingPlaces) {
                    const embedWithThumbnail = this.createEmbed(huntingPlace, huntingPlaces);
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
            lastEmbed.setFooter({text: `Made with ❤️ by Gods version 1.0.4`});
        }

        return embeds;
    }

    private createEmbed(huntingPlace: string, huntingPlaces: { [p: string]: { [p: string]: IBooking[] } }) {
        const embed = new EmbedBuilder();
        let totalDuration = 0;
        //Title
        embed.setTitle(`${huntingPlace}`);

        const huntingSpots = huntingPlaces[huntingPlace];
        for (const huntingSpot in huntingSpots) {
            const __ret = this.processBookingList(huntingSpots, huntingSpot, totalDuration);
            let value = __ret.value;
            let description = __ret.description;
            totalDuration = __ret.totalDuration;

            const ss = dayjs(huntingSpot);
            const ssn = dayjs(ss).add(1, "day");

            //Fields
            const fieldName = `Date ${ss.format("D")}-${ssn.format("D.MM")} SS`;
            this.createFields(value, embed, fieldName);
            this.createDescription(embed, description);
        }

        this.createColor(embed, totalDuration);

        //Thumbnail
        const embedWithThumbnail = this.addThumbnail(embed, huntingPlace);
        return embedWithThumbnail;
    }

    private processBookingList(huntingSpots: { [p: string]: IBooking[] }, huntingSpot: string, totalDuration: number) {
        let value: string = "";
        let description: string = "---Recent Reclaims---\n";
        const bookingsList = huntingSpots[huntingSpot];
        for (const booking of bookingsList) {

            const durationMinutes = dayjs(booking.end).diff(dayjs(booking.start), "minute");
            totalDuration += durationMinutes;

            const timePart = `${dayjs(booking.start).format("HH:mm")}-${dayjs(booking.end).format("HH:mm")}`;

            let namePart = this.createNamePart(booking.name);
            if (booking.reclaim !== undefined) {
                if (booking.reclaim !== null && booking.reclaim.isReclaim) {
                    console.log(booking.reclaim);
                    const reclaimedBooking = `${bold(timePart)} : ${namePart}\n`
                    description += `${bold(timePart)} : ${namePart} by ${this.createNamePart(booking.reclaim.reclaimedBy)}, reclaimed at ${dayjs().format("HH:mm")} with reason: ${booking.reclaim.reclaimedMessage}\n`;
                    value += strikethrough(reclaimedBooking);
                } else {
                    value += `${bold(timePart)} : ${namePart}\n`;
                }
            } else {
                value += `${bold(timePart)} : ${namePart}\n`;
            }
        }
        return {value, description, totalDuration};
    }

    private createNamePart(names: Name) {

        if (names.userInputName && names.userInputName !== "") {
            return `${names.userInputName}`;

        }
        if (names.guildNickName && names.guildNickName !== "") {
            return `${names.guildNickName}`

        }
        return `${names.displayName}`;
    }

    private createColor(embed: EmbedBuilder, totalDuration: number) {

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

    private addThumbnail = (embed: EmbedBuilder, name: string) => {
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

    private createFields(value: string, embed: EmbedBuilder, fieldName: string) {
        if (value.length <= 1024) {
            embed.addFields({
                name: fieldName,
                value: value,
                inline: true,
            });
        } else {
            const x = this.splitStringIntoChunks(value, 1024);
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

    private createDescription(embed: EmbedBuilder, description: string) {
        if (description !== "---Recent Reclaims---\n") {
            embed.setDescription(description);
        }
    }

    private splitStringIntoChunks(inputString: string, maxCharacters: number) {
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

}



