import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getHuntingPlaceByName } from "../huntingplaces/huntingplaces";
import logger from "../logging/logger";
import { UserInput } from "../types";

dayjs.extend(customParseFormat);

class ValidationService {
  public getValidHuntingSpot(userInputSpot: string) {
    const huntingspot = getHuntingPlaceByName(userInputSpot);
    if (!huntingspot || huntingspot === null) {
      logger.error(`your selected hunting ground: ${huntingspot} cannot be found`);
      throw Error(`your selected hunting ground: ${huntingspot} cannot be found`);
    }

    logger.debug(`Selected Huntingspot: ${huntingspot.location}`);
    return huntingspot.location;
  }

  public getValidDate(userInputDate: string): Dayjs {
    const date = dayjs(userInputDate, ["DD.MM.YYYY"], true);
    const isValidDate = date.isValid();
    if (!isValidDate) {
      logger.error(`your selected date: ${date} is not valid`);
      throw Error(
        `your selected date: ${date} is not valid! Please keep to the format like: 01.09.2023`
      );
    }

    logger.debug(`Selected Date: ${date.format()}`);
    return date;
  }

  public getValidStart(validDate: Dayjs, userInputStart: string): Dayjs {
    this.isTimeFormatValid(userInputStart);

    const result = this.parseTimeToDayjs(validDate, userInputStart);

    return result;
  }

  public getValidEnd(validDate: Dayjs, userInputEnd: string) {
    this.isTimeFormatValid(userInputEnd);

    const result = this.parseTimeToDayjs(validDate, userInputEnd);

    return result;
  }

  public getValidUserName(
    userInputName: string,
    guildName: string | null | undefined,
    interactionUserName: string
  ) {
    if (userInputName && userInputName.trim() !== "") {
      logger.debug(`selected username: ${userInputName.trim()}`);
      return userInputName.trim();
    }

    if (guildName && guildName.trim() !== "") {
      logger.debug(`selected username: ${guildName.trim()}`);
      return guildName.trim();
    }

    if (interactionUserName && interactionUserName.trim() !== "") {
      logger.debug(`selected username: ${interactionUserName.trim()}`);
      return interactionUserName.trim();
    }
    logger.debug(`returning default name: ${interactionUserName.trim()}`);
    return interactionUserName.trim();
  }

  public getFinalReservation(reservation: UserInput) {}

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

  private parseTimeToDayjs = (validDate: Dayjs, userInputStart: string): Dayjs => {
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
}
export default ValidationService;
