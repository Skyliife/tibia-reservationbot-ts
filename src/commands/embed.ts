import { SlashCommandBuilder, ChannelType, TextChannel, EmbedBuilder } from "discord.js";

import { SlashCommand } from "../types";
import { createEmbeds } from "../bookingservice/embed.service";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("embed").setDescription("test embed"),
  execute: async (interaction) => {
    const embeds = await createEmbeds();
    interaction.reply({
      embeds: embeds,
    });
  },
};

export default command;
