import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getHuntingPlaces } from "../huntingplaces/huntingplaces";
import { UserInput } from "../types";
import logger from "../logging/logger";
import {
  isCurrentTimeAfter10AM,
  isCurrentTimeBefore10AM,
  isCurrentTimeBeforeMidnight,
} from "../utils";
import Booking from "./booking";
import { GuildRoles } from "../enums";

dayjs.extend(customParseFormat);

class ValidationService {
  public getValidHuntingSpot(userInputSpot: string) {
    const huntingspot = getHuntingPlaces(userInputSpot);
    if (!huntingspot || huntingspot === null) {
      logger.error(`your selected hunting ground: ${huntingspot} cannot be found`);
      throw Error(`your selected hunting ground: ${huntingspot} cannot be found`);
    }

    logger.debug(`Selected Huntingspot: ${huntingspot}`);
    return huntingspot;
  }

  public getValidDate(userInputDate: string): Dayjs {
    const date = dayjs(userInputDate, ["DD.MM.YYYY"], true);
    const isValidDate = date.isValid();
    if (!isValidDate) {
      logger.error(`your selected date: ${date.format()} is not valid`);
      throw Error(
        `your selected date: ${date.format()} is not valid! Please keep to the format like: 01.09.2023`
      );
    }

    logger.debug(`Selected Date: ${date.format()}`);
    return date;
  }

  public getValidStart(validDate: Dayjs, userInputStart: string): Dayjs {
    this.isTimeFormatValid(userInputStart);

    const result = this.parseStartTime(validDate, userInputStart);
    logger.debug(`Selected Start Date: ${result.format()}`);
    return result;
  }

  public getValidEnd(validDate: Dayjs, startDate: Dayjs, userInputEnd: string) {
    this.isTimeFormatValid(userInputEnd);

    const result = this.parseEndTime(validDate, startDate, userInputEnd);
    logger.debug(`Selected End Date: ${result.format()}`);
    return result;
  }

  public getValidUserName(
    userInputName: string,
    guildName: string | null | undefined,
    interactionUserName: string
  ) {
    if (userInputName && userInputName.trim() !== "") {
      logger.debug(`Selected Username: ${userInputName.trim()}`);
      return userInputName.trim();
    }

    if (guildName && guildName.trim() !== "") {
      logger.debug(`Selected Username: ${guildName.trim()}`);
      return guildName.trim();
    }

    if (interactionUserName && interactionUserName.trim() !== "") {
      logger.debug(`Selected Username: ${interactionUserName.trim()}`);
      return interactionUserName.trim();
    }
    logger.debug(`returning default name: ${interactionUserName.trim()}`);
    return interactionUserName.trim();
  }

  public getValidReservation(reservation: UserInput, role: GuildRoles): Booking | undefined {
    const { place, spot, date, start, end, name, uniqueId } = reservation;
    const [serverSaveStart, serverSaveEnd, duration] = this.getServerSaveTimesFromGodRules(role);
    logger.debug(
      `Server Save Start: ${serverSaveStart.format()}; Server Save End: ${serverSaveEnd.format()}`
    );
    const finalReservation = this.getServerSaveValidation(
      start,
      end,
      serverSaveStart,
      serverSaveEnd,
      duration
    );
    if (finalReservation) {
      const booking = new Booking(
        place,
        spot,
        name,
        uniqueId,
        serverSaveStart,
        serverSaveEnd,
        start,
        end
      );
      return booking;
    }
    return undefined;
  }

  private getServerSaveValidation = (
    start: Dayjs,
    end: Dayjs,
    serverSaveStart: Dayjs,
    serverSaveEnd: Dayjs,
    duration: number
  ) => {
    const isValidStart = this.isDateBetweenSS(start, serverSaveStart, serverSaveEnd);
    if (!isValidStart) {
      throw new Error(`Your selected start time ${start.format()} is not within the god rules`);
    }
    const isValidEnd = this.isDateBetweenSS(end, serverSaveStart, serverSaveEnd);
    if (!isValidStart) {
      throw new Error(`Your selected end time ${end.format()} is not within the god rules`);
    }
    const isValidDuration = this.isValidReservationDuration(start, end, duration);

    const result = isValidStart && isValidEnd && isValidDuration;

    return result;
  };

  private getServerSaveTimesFromGodRules = (role: GuildRoles): [any, any, any] => {
    var now = dayjs();

    var serverSaveStart;
    var serverSaveEnd;
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
    }

    serverSaveEnd = serverSaveStart?.add(1, "day").add(0, "hour");
    if (role == GuildRoles.VIP) {
      serverSaveEnd = serverSaveStart?.add(2, "day").add(0, "hour");
    }
    if (role == GuildRoles.Bazant) {
      serverSaveEnd = now.add(2, "day").add(3, "hour");
      duration = 180;
    }
    if (role == GuildRoles.GodsMember) {
      serverSaveEnd = now.add(2, "day").add(3, "hour");
      duration = 180;
    }
    if (role == GuildRoles.Gods) {
      serverSaveEnd = now.add(2, "day").add(3, "hour");
      duration = 180;
    }
    return [serverSaveStart, serverSaveEnd, duration];
  };
  private isValidReservationDuration = (start: Dayjs, end: Dayjs, duration: number) => {
    // Check if the difference in hours between start and end is less than or equal to 2
    const durationInMinutes = end.diff(start, "minute");

    if (durationInMinutes > duration) {
      throw new Error(`Reservation duration exceeds ${duration / 60} hours.`);
    }

    return true;
  };

  private isDateBetweenSS = (date: Dayjs, start: Dayjs, end: Dayjs) => {
    console.log("datetobook", date.format());
    console.log("startServerSave", start.format());
    console.log("endServerSave", end.format());
    console.log("isbetween", date.isBetween(start, end, null, "[]"));
    return date.isBetween(start, end, null, "[]");
  };

  private isTimeFormatValid = (inputString: string) => {
    // Define the regex pattern for 24-hour time format
    var pattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!pattern.test(inputString)) {
      throw new Error(
        `Your input time ${inputString} has not the right format: type something like 00:50, 12:30 or 23:59`
      );
    }
    return pattern.test(inputString);
  };

  private parseStartTime = (validDate: Dayjs, userInputStart: string): Dayjs => {
    var inputTime = userInputStart.split(":");
    var inputHours = parseInt(inputTime[0], 10);
    var inputMinutes = parseInt(inputTime[1], 10);
    const result = dayjs(validDate)
      .set("hour", inputHours)
      .set("minute", inputMinutes)
      .set("second", 0)
      .set("millisecond", 0);
    return result;
  };

  private parseEndTime = (validDate: Dayjs, startDate: Dayjs, userInputStart: string): Dayjs => {
    var inputTime = userInputStart.split(":");
    var inputHours = parseInt(inputTime[0], 10);
    var inputMinutes = parseInt(inputTime[1], 10);
    const result = dayjs(validDate)
      .set("hour", inputHours)
      .set("minute", inputMinutes)
      .set("second", 0)
      .set("millisecond", 0);
    if (result.hour() < startDate.hour()) {
      const nextDayEnd = result.add(1, "day");
      return nextDayEnd;
    }

    return result;
  };
}

export default ValidationService;
