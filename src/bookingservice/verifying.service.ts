import collectingService from "./collecting.service";
import {GuildRoles} from "../enums";
import dayjs, {Dayjs} from "dayjs";
import {isCurrentTimeAfter10AM, isCurrentTimeBefore10AM, isCurrentTimeBeforeMidnight} from "../utils";
import {Name} from "../types";
import Booking from "./booking";
import LocaleManager from "../locale/LocaleManager";

class VerifyingService {

    public booking: Booking;
    private readonly data: collectingService;

    constructor(data: collectingService) {
        this.data = data;
        const reservation = this.data;
        const {place, spot, start, end, names, uniqueId, role, duration} = reservation;
        //Prepare to verify Server save times for current time and role
        const [serverSaveStart, serverSaveEnd, ruleDuration] = this.getServerSaveTimesFromGodRules(role);
        console.log(`Role: ${role} Server Save Start: ${serverSaveStart.format("DD.MM.YYYY")}; Server Save End: ${serverSaveEnd.format("DD.MM.YYYY")}`);
        //Verify if the start and end time are within the server save times
        this.getServerSaveValidation(start, end, serverSaveStart, serverSaveEnd, ruleDuration);
        //if no error happened set the booking
        this.booking = this.getBooking(place, spot, names, uniqueId, serverSaveStart, serverSaveEnd, start, end, ruleDuration);
    }

    private getServerSaveTimesFromGodRules = (role: GuildRoles): [Dayjs, Dayjs, number] => {
        let now = dayjs();
        let serverSaveStart: Dayjs;
        let serverSaveEnd: Dayjs;
        let duration = 120;

        const current = dayjs(now)
            .set("hour", 10)
            .set("minute", 0)
            .set("second", 0)
            .set("millisecond", 0);

        if (isCurrentTimeBeforeMidnight(now) && isCurrentTimeAfter10AM(now)) {
            serverSaveStart = current;
        } else if (isCurrentTimeBefore10AM(now)) {
            serverSaveStart = current.subtract(1, "day");
        } else {
            // Handle the case where serverSaveStart is still undefined
            throw new Error("Unable to determine serverSaveStart");
        }


        if (serverSaveStart) {
            serverSaveEnd = serverSaveStart.add(1, "day").add(0, "hour");

            if (role === GuildRoles.VIP) {
                serverSaveEnd = serverSaveStart.add(2, "day").add(0, "hour");
            }
            if (role === GuildRoles.Bazant || role === GuildRoles.GodsMember || role === GuildRoles.Gods) {
                serverSaveEnd = now.add(2, "day").add(3, "hour");
                duration = 180;
            }
        } else {

            throw new Error("Unable to determine serverSaveEnd and duration");
        }

        return [serverSaveStart, serverSaveEnd, duration];
    };

    private getServerSaveValidation = (start: Dayjs, end: Dayjs, serverSaveStart: Dayjs, serverSaveEnd: Dayjs, duration: number) => {
        const isValidStart = this.isDateBetweenSS(start, serverSaveStart, serverSaveEnd);

        if (!isValidStart) {
            const message = LocaleManager.translate("getServerSaveValidation.start", {prop: `${start.format("DD.MM.YYYY HH:mm")}`})
            throw new Error(message);
        }
        const isValidEnd = this.isDateBetweenSS(end, serverSaveStart, serverSaveEnd);

        if (!isValidEnd) {
            const message = LocaleManager.translate("getServerSaveValidation.end", {prop: `${end.format("DD.MM.YYYY HH:mm")}`})
            throw new Error(message);
        }
        this.isValidReservationDuration(start, end, duration);
    };
    private isValidReservationDuration = (start: Dayjs, end: Dayjs, duration: number) => {
        // Check if the difference in hours between start and end is less than or equal to duration
        const durationInMinutes = end.diff(start, "minute");

        if (durationInMinutes > duration) {
            const message = LocaleManager.translate("isValidReservationDuration", {prop: `${duration / 60}`})
            throw new Error(message);
        }

        return true;
    };

    private isDateBetweenSS = (date: Dayjs, start: Dayjs, end: Dayjs) => {
        return date.isBetween(start, end, null, "[]");
    };

    private getBooking(place: string, spot: string, names: Name, uniqueId: string, serverSaveStart: Dayjs, serverSaveEnd: Dayjs, start: Dayjs, end: Dayjs, roleDuration: number): Booking {
        return new Booking(place, spot, names, uniqueId, serverSaveStart, serverSaveEnd, start, end, dayjs(), roleDuration);
    }
}

export default VerifyingService;