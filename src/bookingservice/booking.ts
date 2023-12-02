import dayjs, { Dayjs } from "dayjs";

class Booking {
  private huntingplace: string;
  private huntingspot: string;
  private name: string;
  private uniqueId: string;
  private start: Dayjs;
  private end: Dayjs;

  constructor(
    huntingplace: string,
    huntingspot: string,
    name: string,
    uniqueId: string,
    start: Dayjs,
    end: Dayjs
  ) {
    this.huntingplace = huntingplace;
    this.huntingspot = huntingspot;
    this.name = name;
    this.uniqueId = uniqueId;
    this.start = start;
    this.end = end;
  }

  public displayBookingInfo(): string {
    return `Booking for ${this.name} with id: ${this.uniqueId} on ${this.start.format()} at ${
      this.huntingspot
    }`;
  }
}

export default Booking;
