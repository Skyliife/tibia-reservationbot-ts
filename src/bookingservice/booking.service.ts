import {
  APIInteractionGuildMember, CacheType, CacheTypeReducer,
  ChatInputCommandInteraction,
  GuildMember, TextBasedChannel,
  TextChannel,
  underscore,
} from 'discord.js';
import { getHuntingPlaceByName } from "../huntingplaces/huntingplaces";
import logger from "../logging/logger";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Booking from "./booking";
import ValidationService from "./validation.service";
import { UserInput } from "../types";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

class BookingService {
  private bookings: Booking[] = [];
  private options: { [key: string]: string | number | boolean } = {};
  private member: CacheTypeReducer<CacheType, GuildMember, any>;
  private interactionUserName: string;
  private validationService: ValidationService;
  private userId: string;
  private channelName = '';

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
    this.userId = interaction.user.id;

    const channel = interaction.channel as TextBasedChannel;

    if (channel && 'name' in channel) {
      this.channelName = channel.name;
    };

    console.log('_________________________________', this.channelName, '____________________________')
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
    const finalReservation = this.validationService.getFinalReservation(reservation);
  };

  private getPlace = (): string => {
    const userInputSpot = this.options.spot.toString();
    const result = this.validationService.getValidHuntingSpot(userInputSpot);
    return result;
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
    const userInputName = this.options.name.toString();
    const guildName = this.member?.nickname;
    const interactionName = this.interactionUserName;
    const result = this.validationService.getValidUserName(
      userInputName,
      guildName,
      interactionName
    );
    return result;
  };

  private getUniqueId = (): string => {
    return this.userId;
  };
}

export default BookingService;
