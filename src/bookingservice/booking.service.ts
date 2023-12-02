import {
  APIInteractionGuildMember,
  CacheType,
  CacheTypeReducer,
  ChatInputCommandInteraction,
  GuildMember,
  TextBasedChannel,
  TextChannel,
  underscore,
} from "discord.js";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Booking from "./booking";
import ValidationService from "./validation.service";
import { UserInput } from "../types";
import logger from "../logging/logger";
import { GuildRoles } from "../enums";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

class BookingService {
  private bookings: Booking[] = [];
  private options: { [key: string]: string | number | boolean } = {};
  private member: CacheTypeReducer<CacheType, GuildMember, any>;
  private interactionUserName: string;
  private interactionDisplayName: string;
  private validationService: ValidationService;
  private userId: string;
  private channelName = "";

  /**
   *
   */
  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this.validationService = new ValidationService();

    for (const optionData of interaction.options.data) {
      if (optionData.name && optionData.value) this.options[optionData.name] = optionData.value;
    }

    this.member = interaction.member;
    this.interactionUserName = interaction.user.username;
    this.interactionDisplayName = interaction.user.displayName;
    this.userId = interaction.user.id;

    const channel = interaction.channel;
    if (channel && "name" in channel) {
      this.channelName = channel.name;
    }
  }

  getUserInput = (): UserInput => {
    const place = this.getPlace();
    const spot = this.getSpot();
    const date = this.getDate();
    const start = this.getStart(date);
    const end = this.getEnd(date);
    const name = this.getUserName();
    const uniqueId = this.getUniqueId();
    const userInput = {
      place,
      spot,
      date,
      start,
      end,
      name,
      uniqueId,
    };
    return userInput;
  };

  validateServerRules = () => {
    //get reservation
    const reservation = this.getUserInput();
    //check server rules for reservation
    if (this.member.role.cache.find((role: any) => role.name === GuildRoles.Verified)) {
      const finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.Verified
      );
    }
    if (this.member.role.cache.find((role: any) => role.name === GuildRoles.VIP)) {
      const finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.VIP
      );
    }
    if (this.member.role.cache.find((role: any) => role.name === GuildRoles.Bazant)) {
      const finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.Bazant
      );
    }
    if (this.member.role.cache.find((role: any) => role.name === GuildRoles.Gods)) {
      const finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.Gods
      );
    }
    if (this.member.role.cache.find((role: any) => role.name === GuildRoles.GodsMember)) {
      const finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.GodsMember
      );
    }
  };

  private getPlace = (): string => {
    return this.channelName;
  };

  private getSpot = (): string => {
    const userInputSpot = this.options.spot.toString();
    const result = this.validationService.getValidHuntingSpot(userInputSpot);
    return result;
  };

  private getDate = (): Dayjs => {
    const userInputDate = this.options.date.toString();
    const date = this.validationService.getValidDate(userInputDate);
    return date;
  };

  private getStart = (date: Dayjs): Dayjs => {
    const userInputStart = this.options.start.toString();
    const start = this.validationService.getValidStart(date, userInputStart);
    return start;
  };

  private getEnd = (date: Dayjs): Dayjs => {
    const userInputEnd = this.options.end.toString();
    const end = this.validationService.getValidEnd(date, userInputEnd);
    return end;
  };

  private getUserName = (): string => {
    let username = "";
    if (this.options.name !== undefined) {
      username = this.options.name.toString();
    }
    const guildName = this.member?.displayName;
    const interactionName = this.interactionUserName;
    const result = this.validationService.getValidUserName(username, guildName, interactionName);
    return result;
  };

  private getUniqueId = (): string => {
    logger.debug(`Selected UserID: ${this.userId}`);
    return this.userId;
  };
}

export default BookingService;
