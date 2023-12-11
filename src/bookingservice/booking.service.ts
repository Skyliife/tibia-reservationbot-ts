import {
  APIInteractionGuildMember,
  CacheType,
  CacheTypeReducer,
  ChatInputCommandInteraction,
  GuildMember,
  TextBasedChannel,
  TextChannel,
  ThreadOnlyChannel,
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
import { createEmbedsForGroups } from "./embed.service";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

class BookingService {
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
    console.log(reservation);
    if (reservation !== undefined) {
      await InsertBooking(reservation);
      const embeds = await this.getEmbeds(reservation.huntingPlace);

      return {
        isBooked: true,
        embeds: embeds,
        displayBookingInfo: reservation.displayBookingInfo(),
      };
    } else {
      logger.error("Reservation can not be inserted to database!");
      throw new Error("Reservation can not be inserted to database!");
    }
  };

  public getEmbeds = async (channelName: string) => {
    const embeds = await createEmbedsForGroups(channelName);
    if (embeds == null || embeds.length === 0) {
      throw new Error("Currently there are no bookings listed");
    }
  };

  private getUserInput = (): UserInput => {
    const place = this.getPlace();
    const spot = this.getSpot(place);
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

    // TO-DO: refactor this! we're currently using this roleprority, otherwise code will fail if a member has 2 roles like
    // gods and verified because it goes into getValidReservation method with the date for verified rules and then throws error not in time range
    const rolePriority = [
      GuildRoles.GodsMember,
      GuildRoles.Gods,
      GuildRoles.Bazant,
      GuildRoles.VIP,
      GuildRoles.Verified,
    ];
    for (const roleToCheck of rolePriority) {
      if (this.member.roles.cache.some((role: any) => role.name === roleToCheck)) {
        console.log(roleToCheck);
        finalReservation = this.validationService.getValidReservation(reservation, roleToCheck);
        break;
      }
    }

    return finalReservation;
  };

  private getPlace = (): string => {
    return this.channelName;
  };

  private getSpot = (place: string): string => {
    const userInputSpot = this.options.spot.toString();
    const spot = this.validationService.getValidHuntingSpot(userInputSpot, place);

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
    const interactionName = this.interaction.user.displayName;
    const name = this.validationService.getValidUserName(username, guildName, interactionName);
    return name;
  };

  private getUniqueId = (): string => {
    logger.debug(`Selected UserID: ${this.interaction.user.id}`);
    return this.interaction.user.id;
  };
}

export default BookingService;
