import { ChatInputCommandInteraction } from "discord.js";
import { getHuntingPlaceByName } from "../huntingplaces/huntingplaces";
import logger from "../logging/logger";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { GuildRoles } from "../types";
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

class BookingService {
  private bookings: Booking[] = [];
  private options: { [key: string]: string | number | boolean } = {};

  /**
   *
   */
  constructor(interaction: ChatInputCommandInteraction) {
    for (let i = 0; i < interaction.options.data.length; i++) {
      const element = interaction.options.data[i];
      if (element.name && element.value) this.options[element.name] = element.value;
    }
  }
  validateSpot = (): string => {
    const userInputSpot = this.options.spot.toString();
    const huntingspot = getHuntingPlaceByName(userInputSpot);
    if (!huntingspot || huntingspot === null) {
      logger.error(`your selected hunting ground: ${huntingspot} cannot be found`);
      throw Error(`your selected hunting ground: ${huntingspot}cannot be found`);
    }
    return huntingspot.location;
  };
  validateDate = (): [Dayjs, Dayjs] => {
    return [dayjs(), dayjs()];
  };
}

function getServerSaveTimes(limitvip: number, limitgods: number, role: string) {
  var now = dayjs();
  logger.info("Currenttime:", now.format());

  let serverSaveStart;
  let serverSaveEnd;

  if (role === GuildRoles.Verified) {
  }

  const x = dayjs(now).set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
  if (isCurrentTimeBeforeMidnight(now) && isCurrentTimeAfter10AM(now)) {
    serverSaveStart = x;
  } else if (isCurrentTimeBefore10AM(now)) {
    serverSaveStart = x.subtract(1, "day");
  }
  serverSaveEnd = serverSaveStart?.add(limitvip, "day").add(limitgods, "hour");

  console.log("GetServerSaveTimes", serverSaveStart?.format(), serverSaveEnd?.format());
  return [serverSaveStart, serverSaveEnd];
}

function isCurrentTimeBeforeMidnight(currentdate: Dayjs) {
  const midnight = currentdate.endOf("day");
  return currentdate.isSameOrBefore(midnight);
}

function isCurrentTimeBefore10AM(currentdate: Dayjs) {
  const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
  return currentdate.isBefore(tenAM);
}

function isCurrentTimeAfter10AM(currentdate: Dayjs) {
  const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
  return currentdate.isSameOrAfter(tenAM);
}

export default BookingService;
