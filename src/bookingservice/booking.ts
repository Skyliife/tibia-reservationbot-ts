import dayjs, {Dayjs} from "dayjs";
import {IBooking, Name} from "../types";
import {
    isAnyTimeAfter10AM,
    isAnyTimeBefore10AM,
    isCurrentTimeAfter10AM,
    isCurrentTimeBefore10AM,
    isCurrentTimeBeforeMidnight
} from "../utils";

class Booking implements IBooking {
    public huntingPlace: string;
    public huntingSpot: string;
    public name: Name;
    public uniqueId: string;
    public serverSaveStart: Dayjs;
    public serverSaveEnd: Dayjs;
    public start: Dayjs;
    public end: Dayjs;
    public createdAt: Dayjs;
    public deletedAt: any;
    public displaySlot: Dayjs;
    public roleDuration: number;

    constructor(
        huntingplace: string,
        huntingspot: string,
        name: Name,
        uniqueId: string,
        serverSaveStart: Dayjs,
        serverSaveEnd: Dayjs,
        start: Dayjs,
        end: Dayjs,
        createdAt: Dayjs,
        roleDuration: number,
    ) {
        this.huntingPlace = huntingplace;
        this.huntingSpot = huntingspot;
        this.name = name;
        this.uniqueId = uniqueId;
        this.serverSaveStart = serverSaveStart;
        this.serverSaveEnd = serverSaveEnd;
        this.start = start;
        this.end = end;
        this.createdAt = createdAt;
        this.roleDuration = roleDuration;
        this.displaySlot = this.getDisplaySlot(this.start);
    }

    public displayBookingInfo(): string {
        return `Booking on ${this.huntingSpot} from ${this.start.format("D.M")} ${this.start.format("HH:mm")} to ${this.end.format("HH:mm")} has been successfully completed`;
    }

    private getDisplaySlot(date: Dayjs): Dayjs {
        const now = dayjs(date);

        let serverSaveStart: Dayjs = dayjs();
        const temp = dayjs(now)
            .set("hour", 10)
            .set("minute", 0)
            .set("second", 0)
            .set("millisecond", 0);
        if (isCurrentTimeBeforeMidnight(now) && isAnyTimeAfter10AM(now)) {
            serverSaveStart = temp;
        } else if (isAnyTimeBefore10AM(now)) {
            serverSaveStart = temp.subtract(1, "day");
        }
        return serverSaveStart;
    }
}

export default Booking;
