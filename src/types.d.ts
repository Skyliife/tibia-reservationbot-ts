import { Dayjs } from "dayjs";
import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";

////////////////////////////////////////////////////////////////////////////////////////////////
//                                          INTERFACES                                        //
////////////////////////////////////////////////////////////////////////////////////////////////
export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

export interface Event {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}
export interface UserInput {
  place: string;
  spot: string;
  date: Dayjs;
  start: Dayjs;
  end: Dayjs;
  name: string;
  uniqueId: string;
}

export interface IBooking extends mongoose.Document {
  huntingPlace: string;
  huntingSpot: string;
  name: string;
  uniqueId: string;
  serverSaveStart: Dayjs;
  serverSaveEnd: Dayjs;
  start: Dayjs;
  end: Dayjs;
  createdAt: Dayjs;
  deletedAt: any;
}
export type DatabaseResultForGroup = {
  [huntingPlace: string]: {
    [huntingSpot: string]: IBooking[];
  };
};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      CLIENTID: string;
      DBURI: string;
      DBNAME: string;
      GUILDTESTSERVER: string;
    }
  }
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
  }
}
