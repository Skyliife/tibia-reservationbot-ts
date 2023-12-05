import { SlashCommandBuilder, ChannelType, TextChannel, EmbedBuilder } from "discord.js";

import { SlashCommand } from "../types";
import { createEmbedsForGroups, createEmbedsForSummary } from "../bookingservice/embed.service";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("embed").setDescription("test embed"),
  execute: async (interaction) => {
    const channel = interaction.channel;
    let channelName;
    if (channel && "name" in channel) {
      channelName = channel.name;
    }
    const embedsForSummary = await createEmbedsForSummary();
    const embedsForChannel = await createEmbedsForGroups(channelName);
    interaction.reply({
      embeds: embedsForChannel,
    });
  },
};

export default command;
