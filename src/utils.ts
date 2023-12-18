import dayjs, {Dayjs} from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import duration from "dayjs/plugin/duration";
import {GuildRoles} from "./enums";
import {IBooking} from "./types";
import {AutocompleteInteraction, CacheType, CacheTypeReducer, GuildMember} from "discord.js";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);

export function isCurrentTimeBeforeMidnight(currentDate: Dayjs) {
    const midnight = currentDate.endOf("day");
    return currentDate.isSameOrBefore(midnight);
}

export function isCurrentTimeBefore10AM(currentDate: Dayjs) {
    const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    return currentDate.isBefore(tenAM);
}
export function isAnyTimeBefore10AM(currentDate: Dayjs) {
    const tenAM = dayjs(currentDate).set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    return currentDate.isBefore(tenAM);
}

export function isCurrentTimeAfter10AM(currentDate: Dayjs) {
    const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    return currentDate.isSameOrAfter(tenAM);
}
export function isAnyTimeAfter10AM(currentDate: Dayjs) {
    const tenAM = dayjs(currentDate).set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
    return currentDate.isSameOrAfter(tenAM);
}



export const areAllCurrentReservationsFromUserWithinRoleDuration = (roleDuration: number, currentReservation: IBooking, existingReservations: IBooking[]) => {
    //console.log(roleDuration);
    const durationInMilliseconds = dayjs.duration(roleDuration, "minutes").asMilliseconds();
    const currentReservationDuration = dayjs(currentReservation.end).diff(dayjs(currentReservation.start), "millisecond");
    //collect the duration of all reservations from user
    const durationOfAllReservationsFromUser = existingReservations.reduce(
        (accumulator, reservation) => accumulator + dayjs(reservation.end).diff(dayjs(reservation.start), "millisecond"),
        0,
    );
    //console.log(durationOfAllReservationsFromUser);
    //console.log(durationInMilliseconds);
    //console.log(durationOfAllReservationsFromUser <= durationInMilliseconds);
    return durationOfAllReservationsFromUser + currentReservationDuration <= durationInMilliseconds;


};

export function isCurrentReservationOverlappingWithExistingReservations(newReservation: IBooking, existingReservations: IBooking[]) {
    const newReservationStart = dayjs(newReservation.start);
    const newReservationEnd = dayjs(newReservation.end);

    return existingReservations.some((existingReservation) => {
        const existingReservationStart = dayjs(existingReservation.start);
        const existingReservationEnd = dayjs(existingReservation.end);

        return (
            newReservationStart.isBetween(existingReservationStart, existingReservationEnd, null, "[)") ||
            newReservationEnd.isBetween(existingReservationStart, existingReservationEnd, null, "(]") ||
            existingReservationStart.isBetween(newReservationStart, newReservationEnd, null, "[)") ||
            existingReservationEnd.isBetween(newReservationStart, newReservationEnd, null, "(]")
        );
    });
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

    let dates: [] = [];
    for (const roleToCheck of rolePriority) {
        if (member?.roles.cache.some((role: any) => {

            return role.name === roleToCheck
        })) {
            dates = getFormattedTimeRange(roleToCheck)
            break;
        }
    }

    return dates.map((choice) => ({name: choice, value: choice}));

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

function getFormattedTimeRange(role: string) {
    const values = getTimeRangeForUser(role);
    const results: any = [];
    values.forEach((element) => {
        // console.log(element);
        // Manipulate each element as needed
        const date = dayjs(element);

        results.push(date.format("DD.MM.YYYY"));
    });
    return results;
}

function getTimeRangeForUser(role: string) {
    const currentDate = new Date();

    const currentDateStart = new Date(currentDate);
    const nextDayEndTime = new Date(currentDate);

    currentDateStart.setHours(10, 0, 0, 0);
    nextDayEndTime.setHours(23, 59, 59, 999);

    const dates = [];

    dates.push(currentDate);

    if (currentDate >= currentDateStart && currentDate <= nextDayEndTime) {
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
        } else if (role === "Gods Member" || role === "GODS" || role === "BAZANT") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
            const dateForNextNextDay = new Date(currentDate);
            dateForNextNextDay.setDate(currentDate.getDate() + 2);
            dates.push(dateForNextNextDay);
        }
    } else if (currentDate <= currentDateStart) {
        if (role === "VIP") {
            const dateForNextDay = new Date(currentDate);
            dateForNextDay.setDate(currentDate.getDate() + 1);
            dates.push(dateForNextDay);
        } else if (role === "Gods Member" || role === "GODS" || role === "BAZANT") {
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


