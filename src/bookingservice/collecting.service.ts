import {ChatInputCommandInteraction, GuildMember, TextChannel} from "discord.js";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import logger from "../logging/logger";
import {getHuntingPlaceByChannelName} from "../huntingplaces/huntingplaces";
import {GuildRoles} from "../enums";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type Name = {
    userInputName: string
    displayName: string;
    guildNickName: string;
    interactionName: string;
};

class CollectingService {

    public place = "";
    public spot = "";
    public date: Dayjs = dayjs();
    public start: Dayjs = dayjs();
    public end: Dayjs = dayjs();
    public names: Name = {userInputName: "", displayName: "", guildNickName: "", interactionName: ""};
    public uniqueId = "";
    public role: GuildRoles;
    public duration = 0;
    private readonly interaction;
    private readonly member;
    private options: { [key: string]: string | number | boolean } = {};


    constructor(interaction: ChatInputCommandInteraction) {
        this.interaction = interaction;
        this.member = interaction.member as GuildMember;

        for (const optionData of interaction.options.data) {
            if (optionData.name && optionData.value) this.options[optionData.name] = optionData.value;
        }
        this.place = this.collectPlace();
        this.spot = this.collectSpot(this.place);
        this.date = this.collectDate();
        this.start = this.collectStart(this.date);
        this.end = this.collectEnd(this.date, this.start);
        this.names = this.collectNames();
        this.uniqueId = this.collectUniqueId();
        this.role = this.collectRole();
        this.duration = this.collectDuration(this.start, this.end);
    }

    private collectPlace = (): string => {
        const channel = this.interaction.channel as TextChannel;
        if (!channel) {
            throw new Error("Channel not found.");
        }
        logger.debug(`Hunting place: ${channel.name}`);
        return channel.name;
    };

    private collectSpot = (place: string): string => {
        const userInputSpot = this.options.spot.toString();
        const location = getHuntingPlaceByChannelName(place);

        if (!location) {
            throw new Error(`Hunting place ${place} not found. Please use a hunting channel to make a reservation`);
        }
        const huntingSpot = location.choices.find((choice) => choice.name === userInputSpot);

        if (!huntingSpot) {
            throw new Error(`Hunting spot ${userInputSpot} in ${place} not found.`);
        }
        return this.options.spot.toString();
    };

    private collectDate = (): Dayjs => {
        const userInputDate = this.options.date.toString();
        const date = dayjs(userInputDate, ["DD.MM.YYYY", "DD.M.YYYY", "D.MM.YYYY", "D.M.YYYY"], true);
        const isValidDate = date.isValid();
        if (!isValidDate) {
            logger.error(`your selected date: ${date.format()} is not valid`);
            throw new Error(
                `your selected date: ${userInputDate} is not valid! Please keep to the format like: 01.09.2023`
            );
        }

        logger.debug(`Selected Date: ${date.format("DD.MM.YYYY")}`);
        return date;

    };

    private collectStart = (date: Dayjs): Dayjs => {
        const userInputStart = this.options.start.toString();
        this.isTimeFormatValid(userInputStart);
        const startDate = this.parseStartTime(date, userInputStart);
        logger.debug(`Selected Start Date: ${startDate.format("DD.MM.YYYY")}`);
        return startDate;

    };

    private collectEnd = (date: Dayjs, startDate: Dayjs): Dayjs => {
        const userInputEnd = this.options.end.toString();
        this.isTimeFormatValid(userInputEnd);

        const endDate = this.parseEndTime(date, startDate, userInputEnd);

        if (endDate.isBefore(startDate)) {
            throw new Error(`your selected end time ${endDate.format("HH:mm")} is in the past`);
        }
        logger.debug(`Selected End Date: ${endDate.format("DD.MM.YYYY")}`);
        return endDate;
    };

    private collectNames = (): Name => {
        let name: Name = {userInputName: "", displayName: "", guildNickName: "", interactionName: ""}

        if (this.interaction.inCachedGuild()) {
            name.displayName = this.interaction.user.displayName;
            name.interactionName = this.interaction.user.username;

            if (this.member.nickname) {
                name.guildNickName = this.member.nickname;
            }

            if (this.options.name) {
                name.userInputName = this.options.name.toString();
            }

        }
        logger.debug(`Usernames: ${JSON.stringify(name)}`);
        return name;
    };

    private collectUniqueId = (): string => {
        logger.debug(`Selected UserID: ${this.interaction.user.id}`);
        return this.interaction.user.id;
    };

    private collectRole = (): GuildRoles => {
        const rolePriority = [
            GuildRoles.GodsMember,
            GuildRoles.Gods,
            GuildRoles.Bazant,
            GuildRoles.VIP,
            GuildRoles.Verified,
        ];

        if (this.interaction.inCachedGuild() && this.member) {
            for (const roleToCheck of rolePriority) {
                if (this.member.roles.cache.some((role: any) => role.name === roleToCheck)) {
                    logger.debug(`Highest user role: ${roleToCheck}`);
                    return roleToCheck;
                }
            }
        }
        throw new Error("you are not allowed to use this command");

    };

    private collectDuration(start: Dayjs, end: Dayjs) {

        return end.diff(start);
    }

    private isTimeFormatValid = (inputString: string) => {
        // Define the regex pattern for 24-hour time format
        const pattern = /^(?:2[0-3]|1[0-9]|0?[0-9]):[0-5]\d$/;
        if (!pattern.test(inputString)) {
            throw new Error(`Your input time ${inputString} has not the right format \"hh:mm\": type something like 00:50, 12:30 or 23:59`);
        }
        return pattern.test(inputString);
    };

    private parseStartTime = (validDate: Dayjs, userInputStart: string): Dayjs => {
        const inputTime = userInputStart.split(":");
        const inputHours = parseInt(inputTime[0], 10);
        const inputMinutes = parseInt(inputTime[1], 10);
        return dayjs(validDate)
            .set("hour", inputHours)
            .set("minute", inputMinutes)
            .set("second", 0)
            .set("millisecond", 0);
    };

    private parseEndTime = (validDate: Dayjs, startDate: Dayjs, userInputStart: string): Dayjs => {
        const inputTime = userInputStart.split(":");
        const inputHours = parseInt(inputTime[0], 10);
        const inputMinutes = parseInt(inputTime[1], 10);
        const result = dayjs(validDate)
            .set("hour", inputHours)
            .set("minute", inputMinutes)
            .set("second", 0)
            .set("millisecond", 0);
        if (result.hour() < startDate.hour()) {
            return result.add(1, "day");
        }

        return result;
    };


}

export default CollectingService;