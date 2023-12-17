import {ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel} from "discord.js";

import {SlashCommand} from "../types";
import CommandProcessor from "../bookingservice/CommandProcessor";
import logger from "../logging/logger";

const optionNames = {
    target: "user",
};

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("statistic")
        .addUserOption((option) => {
            return option
                .setName(optionNames.target)
                .setDescription('The user used for the statistic')
                .setRequired(true);
        })
        .setDescription('Info about a user'),


    execute: async (interaction) => {
        const commandProcessor = new CommandProcessor(interaction);

        try {
            await interaction.deferReply({ephemeral: true});
            if (interaction.inCachedGuild()) {
                const member = interaction.member;
                if (member.roles.cache.some(role => role.name === 'Letter Admin')) {

                    await executeUserCommand(interaction, commandProcessor);

                } else {
                    await interaction.editReply({content: `You are not allowed to use this command!`});
                }
            }

        } catch (error: any) {
            logger.error(error.message);
            console.log(error);
            await interaction.editReply({content: `Something went wrong... ${error.message}`});
        }
    },
};

async function executeUserCommand(interaction: ChatInputCommandInteraction, commandProcessor: CommandProcessor) {
    const selectedUser = interaction.options.getUser(optionNames.target)!;
    const userId = selectedUser.id;

    const channel = fetchChannelName(interaction.channel);
    await commandProcessor.createStatisticsChartForUser(userId);

    await interaction.editReply({
        content: `Successfully executed statistics for user ${interaction.options.getUser(optionNames.target)}!`,
    });


}

const fetchChannelName = (channel: any): string | undefined => {
    return channel?.name;
};

export default command;
