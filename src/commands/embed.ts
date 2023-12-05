import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
} from "discord.js";

import { SlashCommand } from "../types";
import { createEmbedsForSummary } from "../bookingservice/embed.service";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("test embed"),
  execute: async (interaction) => {
    const embeds = await createEmbedsForSummary();
    interaction.reply({
      embeds: embeds,
    });
  },
};

export default command;
