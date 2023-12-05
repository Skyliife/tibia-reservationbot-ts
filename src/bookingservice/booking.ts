import dayjs, { Dayjs } from "dayjs";
import { IBooking } from "../types";
import {
  isCurrentTimeAfter10AM,
  isCurrentTimeBefore10AM,
  isCurrentTimeBeforeMidnight,
} from "../utils";

class Booking implements IBooking {
  public huntingPlace: string;
  public huntingSpot: string;
  public name: string;
  public uniqueId: string;
  public serverSaveStart: Dayjs;
  public serverSaveEnd: Dayjs;
  public start: Dayjs;
  public end: Dayjs;
  public createdAt: Dayjs;
  public deletedAt: any;
  public displaySlot: Dayjs;

  constructor(
    huntingplace: string,
    huntingspot: string,
    name: string,
    uniqueId: string,
    serverSaveStart: Dayjs,
    serverSaveEnd: Dayjs,
    start: Dayjs,
    end: Dayjs,
    createdAt: Dayjs
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
    this.displaySlot = this.getDisplaySlot(this.start);
  }
  private getDisplaySlot(date: Dayjs): Dayjs {
    var now = dayjs(date);

    console.log("Currenttime:", now.format());

    var serverSaveStart: Dayjs = dayjs();
    const x = dayjs(now)
      .set("hour", 10)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0);
    if (isCurrentTimeBeforeMidnight(now) && isCurrentTimeAfter10AM(now)) {
      serverSaveStart = x;
    } else if (isCurrentTimeBefore10AM(now)) {
      serverSaveStart = x.subtract(1, "day");
    }
    return serverSaveStart;
  }

  public displayBookingInfo(): string {
    return `Booking for ${this.name} with id: ${
      this.uniqueId
    } on ${this.start.format()} at ${this.huntingSpot}`;
  }
}

export default Booking;
