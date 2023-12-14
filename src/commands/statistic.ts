import {ChannelType, SlashCommandBuilder} from "discord.js";

import {SlashCommand} from "../types";
import logger from "../logging/logger";
import CommandProcessor from "../bookingservice/CommandProcessor";

const optionNames = {
    place: "place",
    spot: "spot",
    name: "name",
};
const command: SlashCommand = {
    command: new SlashCommandBuilder().setName("statistic")
        .addStringOption((option) => option.setName(optionNames.place).setDescription("Select a hunting place").setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option.setName(optionNames.spot).setDescription("Select a hunting spot").setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option.setName(optionNames.name).setDescription("Select a user").setRequired(true).setAutocomplete(true))
        .setDescription("get the statistics from a user"),
    execute: async (interaction) => {
        const commandProcessor = new CommandProcessor(interaction);
        try {
            await interaction.deferReply({ephemeral: true});
            const channel = fetchChannelName(interaction.channel);

            await commandProcessor.clearMessages();
            await commandProcessor.createChart();
            await interaction.editReply({
                content: "Successfully fetched data!",
            });
            await interaction.deleteReply();
        } catch (error: any) {
            logger.error(error.message);
            console.log(error);
            await interaction.editReply({content: `Something went wrong... ${error.message}`});
        }

    },
};
const fetchChannelName = (channel: any): string | undefined => {
    return channel?.name;
};

export default command;
