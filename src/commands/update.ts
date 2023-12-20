import {ChannelType, SlashCommandBuilder} from "discord.js";

import {SlashCommand} from "../types";
import logger from "../logging/logger";
import CommandProcessor from "../bookingservice/CommandProcessor";

const command: SlashCommand = {
    command: new SlashCommandBuilder().setName("update").setDescription("update the reservations of the channel"),
    execute: async (interaction) => {
        let commandProcessor: CommandProcessor | null = new CommandProcessor(interaction);
        try {
            await interaction.deferReply({ephemeral: true});
            const channel = fetchChannelName(interaction.channel);

            await commandProcessor.clearMessages();
            await commandProcessor.createImage();
            await commandProcessor.createEmbed();
            await commandProcessor.createSummaryChart();
            await interaction.editReply({
                content: "Updated reservations!",
            });
            await interaction.deleteReply();
            commandProcessor = null;
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
