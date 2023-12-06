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

    interaction.channel?.messages.fetch({ limit: 100 }).then(async (msgs) => {
      if (interaction.channel?.type === ChannelType.DM) return;
      const deletedMessages = await interaction.channel?.bulkDelete(msgs, true);
    });

    //const embedsForSummary = await createEmbedsForSummary();
    const embedsForChannel = await createEmbedsForGroups(channelName);
    const embedsArray = embedsForChannel.map((item) => item.embed);
    const embedsAttachment = embedsForChannel.map((item) => item.attachment);
    await interaction.reply({
      embeds: embedsArray,
      files: embedsAttachment,
    });
  },
};

export default command;
