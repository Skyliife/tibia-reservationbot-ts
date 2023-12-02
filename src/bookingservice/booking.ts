import dayjs, { Dayjs } from "dayjs";

class Booking {
  private huntingPlace: string;
  private huntingSpot: string;
  private name: string;
  private uniqueId: string;
  private serverSaveStart: Dayjs;
  private serverSaveEnd: Dayjs;
  private start: Dayjs;
  private end: Dayjs;

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
