import dayjs, { Dayjs } from "dayjs";

class Booking {
  public huntingPlace: string;
  public huntingSpot: string;
  public name: string;
  public uniqueId: string;
  public serverSaveStart: Dayjs;
  public serverSaveEnd: Dayjs;
  public start: Dayjs;
  public end: Dayjs;

  constructor(
    huntingPlace: string,
    huntingSpot: string,
    name: string,
    uniqueId: string,
    serverSaveStart: Dayjs,
    serverSaveEnd: Dayjs,
    start: Dayjs,
    end: Dayjs
  ) {
    this.huntingPlace = huntingPlace;
    this.huntingSpot = huntingSpot;
    this.name = name;
    this.uniqueId = uniqueId;
    this.serverSaveStart = serverSaveStart;
    this.serverSaveEnd = serverSaveEnd;
    this.start = start;
    this.end = end;
  }

  public displayBookingInfo(): string {
    return `Booking for ${this.name} with id: ${this.uniqueId} on ${this.start.format()} at ${
      this.huntingSpot
    }`;
  }
}

export default Booking;
