import {ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel} from "discord.js";

import {SlashCommand} from "../types";
import CommandProcessor from "../bookingservice/CommandProcessor";
import logger from "../logging/logger";

const optionNames = {
    target: "target",
    place: "place",
    spot: "spot",
    name: "name",
};

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("statistic")
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .addUserOption((option) =>
                    option
                        .setName(optionNames.target).setDescription('The user').setRequired(true)
                )
                .setDescription('Info about a user')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('huntingplace')
                .addStringOption((option) =>
                    option
                        .setName(optionNames.place).setDescription("Select a place").setRequired(true)
                )
                .setDescription('Info about the server')
        )
        .setDescription("Info about a hunting statistics"),

    execute: async (interaction) => {
        const commandProcessor = new CommandProcessor(interaction);

        try {
            await interaction.deferReply({ephemeral: true});
            if (interaction.inCachedGuild()) {
                const member = interaction.member;
                if (member.roles.cache.some(role => role.name === 'Letter Admin')) {
                    if (interaction.options.getSubcommand() === "user") {
                        await executeUserCommand(interaction, commandProcessor);
                    }
                    if (interaction.options.getSubcommand() === "huntingplace") {
                        await executeHuntingPlaceCommand(interaction, commandProcessor);
                    }

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
    const selectedUser = interaction.options.getUser("target")!;
    const userId = selectedUser.id;

    const channel = fetchChannelName(interaction.channel);
    await commandProcessor.createStatisticsChartForUser(userId);

    await interaction.editReply({
        content: `Successfully executed statistics for user ${interaction.options.getUser("target")}!`,
    });


}

async function executeHuntingPlaceCommand(interaction: ChatInputCommandInteraction, commandProcessor: CommandProcessor) {

    const channel = interaction.channel as TextChannel;
    await commandProcessor.createStatisticsChartForHuntingPlace(channel);

    await interaction.editReply({
        content: "Successfully executed huntingplace!",
    });

}

const fetchChannelName = (channel: any): string | undefined => {
    return channel?.name;
};

export default command;
