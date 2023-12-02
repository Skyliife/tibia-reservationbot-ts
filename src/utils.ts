import { GuildRoles } from "./types";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function getGuildRoleFromString(roleString: string): GuildRoles | undefined {
  const roleKeys = Object.keys(GuildRoles) as (keyof typeof GuildRoles)[];
  const foundRole = roleKeys.find((key) => GuildRoles[key] === roleString);

  return foundRole ? GuildRoles[foundRole] : undefined;
}

export function isCurrentTimeBeforeMidnight(currentdate: Dayjs) {
  const midnight = currentdate.endOf("day");
  return currentdate.isSameOrBefore(midnight);
}

export function isCurrentTimeBefore10AM(currentdate: Dayjs) {
  const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
  return currentdate.isBefore(tenAM);
}

export function isCurrentTimeAfter10AM(currentdate: Dayjs) {
  const tenAM = dayjs().set("hour", 10).set("minute", 0).set("second", 0).set("millisecond", 0);
  return currentdate.isSameOrAfter(tenAM);
}
