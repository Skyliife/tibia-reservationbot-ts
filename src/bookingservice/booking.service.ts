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
import { InsertBooking } from "./database.service";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

class BookingService {
  private bookings: Booking[] = [];
  private options: { [key: string]: string | number | boolean } = {};
  private member: CacheTypeReducer<CacheType, GuildMember, any>;
  private interaction: ChatInputCommandInteraction<CacheType>;

  private validationService: ValidationService;

  private channelName = "";

  /**
   *
   */
  constructor(interaction: ChatInputCommandInteraction<CacheType>) {
    this.validationService = new ValidationService();

    for (const optionData of interaction.options.data) {
      if (optionData.name && optionData.value) this.options[optionData.name] = optionData.value;
    }
    this.interaction = interaction;
    this.member = interaction.member;

    const channel = interaction.channel;
    if (channel && "name" in channel) {
      this.channelName = channel.name;
    }
  }

  public tryCreateBooking = async () => {
    const reservation = this.validateServerRules();
    if (reservation !== undefined) {
      return await InsertBooking(reservation);
    }
    throw new Error("Something went wrong... Please try again");
  };

  private getUserInput = (): UserInput => {
    const place = this.getPlace();
    const spot = this.getSpot();
    const date = this.getDate();
    const start = this.getStart(date);
    const end = this.getEnd(date, start);
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

  //Refactor this!!!
  private validateServerRules = () => {
    //get reservation
    const reservation = this.getUserInput();
    let finalReservation;
    //check server rules for reservation
    console.log(this.member.roles);

    if (this.member.roles.cache.find((role: any) => role.name === GuildRoles.Verified)) {
      finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.Verified
      );
    }
    if (this.member.roles.cache.find((role: any) => role.name === GuildRoles.VIP)) {
      finalReservation = this.validationService.getValidReservation(reservation, GuildRoles.VIP);
    }
    if (this.member.roles.cache.find((role: any) => role.name === GuildRoles.Bazant)) {
      finalReservation = this.validationService.getValidReservation(reservation, GuildRoles.Bazant);
    }
    if (this.member.roles.cache.find((role: any) => role.name === GuildRoles.Gods)) {
      finalReservation = this.validationService.getValidReservation(reservation, GuildRoles.Gods);
    }
    if (this.member.roles.cache.find((role: any) => role.name === GuildRoles.GodsMember)) {
      finalReservation = this.validationService.getValidReservation(
        reservation,
        GuildRoles.GodsMember
      );
    }
    if (finalReservation !== undefined) {
      return finalReservation;
    }
    return undefined;
  };

  private getPlace = (): string => {
    return this.channelName;
  };

  private getSpot = (): string => {
    const userInputSpot = this.options.spot.toString();
    const spot = this.validationService.getValidHuntingSpot(userInputSpot);
    return spot;
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

  private getEnd = (date: Dayjs, startDate: Dayjs): Dayjs => {
    const userInputEnd = this.options.end.toString();
    const end = this.validationService.getValidEnd(date, startDate, userInputEnd);
    return end;
  };

  private getUserName = (): string => {
    let username = "";
    if (this.options.name !== undefined) {
      username = this.options.name.toString();
    }
    const guildName = this.member?.displayName;
    const interactionName = this.interaction.user.username;
    const name = this.validationService.getValidUserName(username, guildName, interactionName);
    return name;
  };

  private getUniqueId = (): string => {
    logger.debug(`Selected UserID: ${this.interaction.user.id}`);
    return this.interaction.user.id;
  };
}

export default BookingService;
