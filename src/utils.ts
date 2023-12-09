import dayjs, {Dayjs} from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {GuildRoles} from "./enums";
import {IBooking} from "./types";
import {
    AutocompleteInteraction,
    CacheType,
    CacheTypeReducer,
    ChatInputCommandInteraction,
    GuildMember
} from "discord.js";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function getGuildRoleFromString(roleString: string): GuildRoles | undefined {
    const roleKeys = Object.keys(GuildRoles) as (keyof typeof GuildRoles)[];
    const foundRole = roleKeys.find((key) => GuildRoles[key] === roleString);

    return foundRole ? GuildRoles[foundRole] : undefined;
}

export function isCurrentTimeBeforeMidnight(currentdate: Dayjs) {
    const midnight = currentdate.endOf("day");
    return currentdate.isSameOrBefore(midnight);
}

export function isCurrentTimeBefore10AM(currentdate: Dayjs) {
    const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    return currentdate.isBefore(tenAM);
}

export function isCurrentTimeAfter10AM(currentdate: Dayjs) {
    const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    return currentdate.isSameOrAfter(tenAM);
}

export function isCurrentReservationOverlappingWithExistingReservations(newReservation: IBooking, existingReservations: IBooking[]) {
    const newReservationStart = dayjs(newReservation.start);
    const newReservationEnd = dayjs(newReservation.end);

    const isOverlapping = existingReservations.some((existingReservation) => {
        const existingReservationStart = dayjs(existingReservation.start);
        const existingReservationEnd = dayjs(existingReservation.end);

        return (
            newReservationStart.isBetween(existingReservationStart, existingReservationEnd, null, "[)") ||
            newReservationEnd.isBetween(existingReservationStart, existingReservationEnd, null, "(]") ||
            existingReservationStart.isBetween(newReservationStart, newReservationEnd, null, "[)") ||
            existingReservationEnd.isBetween(newReservationStart, newReservationEnd, null, "(]")
        );
    });
    return isOverlapping;
}

export const getChoicesForDate = (interaction: AutocompleteInteraction<CacheType>) => {
    const rolePriority = [
        GuildRoles.GodsMember,
        GuildRoles.Gods,
        GuildRoles.Bazant,
        GuildRoles.VIP,
        GuildRoles.Verified,
    ];
    const member: CacheTypeReducer<CacheType, GuildMember, any> = interaction.member;

    let dates:[] =[];
    for (const roleToCheck of rolePriority) {
        if (member?.roles.cache.some((role: any) => role.name === roleToCheck)) {
            dates = getFormatedTimeRange(roleToCheck)
            break;
        }
    }

    return dates.map((choice) => ({ name: choice, value: choice }));

}
export const getChoicesForTime = () => {
    const choices: { name: string; value: string }[] = [];

    for (let hour = 0; hour < 24; hour++) {
        const formattedHour = hour.toString().padStart(2, '0');
        const timeString = `${formattedHour}:00`;

        choices.push({name: timeString, value: timeString});
    }

    return choices;
}

function getFormatedTimeRange(role: string) {
    const values = getTimeRangeForUser(role);
    const results: any = [];
    values.forEach((element) => {
        console.log(element);
        // Manipulate each element as needed


        // Push the manipulated element into the new array

        results.push(element.toLocaleDateString());
    });
    return results;
}

function getTimeRangeForUser(role: string) {
    const currentDate = new Date();

    const currentdateStart = new Date(currentDate);
    const nextDayEndTime = new Date(currentDate);

    currentdateStart.setHours(10, 0, 0, 0);
    nextDayEndTime.setHours(23, 59, 59, 999);

    const dates = [];
    console.log("currentDate", currentDate);
    console.log("currentdateStart", currentdateStart);
    console.log("nextDayEndTime", nextDayEndTime);

    dates.push(currentDate);

    if (currentDate >= currentdateStart && currentDate <= nextDayEndTime) {
        if (role === "Verified") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
        } else if (role === "VIP") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
            const dateForNextNextDay = new Date(currentDate);
            dateForNextNextDay.setDate(currentDate.getDate() + 2);
            dates.push(dateForNextNextDay);
        } else if (role === "Gods Member") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
            const dateForNextNextDay = new Date(currentDate);
            dateForNextNextDay.setDate(currentDate.getDate() + 2);
            dates.push(dateForNextNextDay);
        }
    } else if (currentDate <= currentdateStart) {
        if (role === "VIP") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
        } else if (role === "Gods Member") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
            const dateForNextNextDay = new Date(currentDate);
            dateForNextNextDay.setDate(currentDate.getDate() + 2);
            dates.push(dateForNextNextDay);
        }
    }

    return dates;
}


