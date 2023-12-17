import {ChatInputCommandInteraction, GuildMember, TextChannel} from "discord.js";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import logger from "../logging/logger";
import {getHuntingPlaceByChannelName} from "../huntingplaces/huntingplaces";
import {GuildRoles} from "../enums";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {Name} from "../types";
import LocaleManager from "../locale/LocaleManager";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


class CollectingService {

    public place = "";
    public spot = "";
    public date: Dayjs = dayjs();
    public start: Dayjs = dayjs();
    public end: Dayjs = dayjs();
    public names: Name;
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
            const message = LocaleManager.translate("collectPlace");
            logger.error(LocaleManager.printInDefaultLanguage("collectPlace"));
            throw new Error(message);
        }
        logger.debug(`Hunting place: ${channel.name}`);
        return channel.name;
    };

    private collectSpot = (place: string): string => {
        const userInputSpot = this.options.spot.toString();
        const location = getHuntingPlaceByChannelName(place);

        if (!location) {

            const message = LocaleManager.translate("collectSpot.location", {prop: `${place}`});
            throw new Error(message);
        }
        const huntingSpot = location.choices.find((choice) => choice.name === userInputSpot);

        if (!huntingSpot) {
            const message = LocaleManager.translate("collectSpot.huntingSpot", {
                prop: `${userInputSpot}`,
                prop2: `${place}`
            });
            throw new Error(message);
        }
        return this.options.spot.toString();
    };

    private collectDate = (): Dayjs => {
        const userInputDate = this.options.date.toString();
        const date = dayjs(userInputDate, ["DD.MM.YYYY", "DD.M.YYYY", "D.MM.YYYY", "D.M.YYYY"], true);
        const isValidDate = date.isValid();
        if (!isValidDate) {
            const message = LocaleManager.translate("collectDate", {prop: `${userInputDate}`});
            logger.error(`your selected date: ${date.format()} is not valid`);
            throw new Error(message);
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
            const message = LocaleManager.translate("collectEnd", {prop: `${endDate.format("HH:mm")}`});
            throw new Error(message);
        }
        logger.debug(`Selected End Date: ${endDate.format("DD.MM.YYYY")}`);
        return endDate;
    };

    private collectNames = (): Name => {
        let name: Name = {userInputName: "", displayName: "", guildNickName: "", interactionName: "", globalName: ""};

        name.displayName = this.interaction.user.displayName;
        name.interactionName = this.interaction.user.username;

        if (this.member.nickname) {
            name.guildNickName = this.member.nickname;
        }

        if (this.options.name) {
            name.userInputName = this.options.name.toString();
        }
        if (this.interaction.user.globalName) {
            name.globalName = this.interaction.user.globalName;
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
        const message = LocaleManager.translate("collectRole");
        throw new Error(message);

    };

    private collectDuration(start: Dayjs, end: Dayjs) {

        const durationInMilliseconds = end.diff(start);
        const isAtLeast15Minutes = durationInMilliseconds >= 900000;
        if (isAtLeast15Minutes) {
            logger.info('The duration is at least 15 minutes.');
        } else {
            const message = LocaleManager.translate("collectDuration");
            throw new Error(message);
        }
        return end.diff(start);
    }

    private isTimeFormatValid = (inputString: string) => {
        // Define the regex pattern for 24-hour time format
        const pattern = /^(?:2[0-3]|1[0-9]|0?[0-9]):[0-5]\d$/;
        if (!pattern.test(inputString)) {
            const message = LocaleManager.translate("isTimeFormatValid", {prop: `${inputString}`});
            throw new Error(message);
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