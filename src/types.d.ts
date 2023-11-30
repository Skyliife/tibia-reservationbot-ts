import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";

export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => void;
  cooldown?: number; // in seconds
}
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
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
  }
}

export interface Event {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

export enum GuildRoles {
  Verified = "Verified",
  VIP = "VIP",
  GodsMember = "Gods Member",
  Gods = "GODS",
  Bazant = "BAZANT",
}
