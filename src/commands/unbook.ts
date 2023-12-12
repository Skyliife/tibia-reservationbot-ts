import {ChannelType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import {IBooking, SlashCommand} from "../types";
import {deleteBookingsForUserId, getBookingsForUserId} from "../bookingservice/database.service";
import logger from "../logging/logger";
import CommandProcessor from "../bookingservice/CommandProcessor";

let choices: { formattedString: string; reservation: IBooking | null }[] = [];

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("unbook")
        .addStringOption((option) => {
            return option
                .setName("reservation")
                .setDescription("Select a reservation to delete")
                .setRequired(true)
                .setAutocomplete(true);
        })
        .setDescription("Delete a reservation"),

    autocomplete: async (interaction) => {
        const channel = interaction.channel;
        const channelName = fetchChannelName(channel);
        const member = interaction.member as GuildMember

        await fetchAndSetChoices(channelName, interaction.user.id, member.guild.id);

        await interaction.respond(generateAutocompleteChoices(choices));
    },

    execute: async (interaction) => {
        const channel = interaction.channel;
        const channelName = fetchChannelName(channel);
        const input = interaction.options.getString("reservation");
        const dataToDelete = choices.find((choice) => choice.formattedString === input);

        try {
            await interaction.deferReply({ephemeral: true});

            if (dataToDelete && channelName !== undefined) {
                await deleteReservation(interaction, dataToDelete);
            } else {
                await interaction.editReply({
                    content: `No reservation found, nothing has been deleted`,
                });
            }
        } catch (error: any) {
            console.log(error);
            await interaction.editReply({
                content: `No reservation found, nothing has been deleted`,
            });
        }
    },
};
const fetchChannelName = (channel: any): string | undefined => {
    return channel?.name;
};

const generateAutocompleteChoices = (choices: { formattedString: string }[]): any[] => {
    return choices.map((choice) => ({
        name: choice.formattedString,
        value: choice.formattedString,
    }));
};

const fetchAndSetChoices = async (channelName: string | undefined, userId: string, databaseId: string) => {
    try {
        choices = await getBookingsForUserId(channelName, userId, databaseId);
        if (choices.length === 0) {
            choices = [{formattedString: "No reservation found", reservation: null}];
        }
    } catch (error: any) {
        logger.error(error.message);
    }
};

const deleteReservation = async (interaction: ChatInputCommandInteraction, dataToDelete: {
    reservation?: IBooking | null
}) => {
    try {
        const {reservation} = dataToDelete;

        const channelName = fetchChannelName(interaction.channel);
        const huntingSpot = reservation?.huntingSpot;
        const start = reservation?.start;
        const end = reservation?.end;
        const member = interaction.member as GuildMember
        const commandProcessor = new CommandProcessor(interaction);
        if (huntingSpot !== undefined && channelName !== undefined && start !== undefined && end !== undefined) {
            await deleteBookingsForUserId(channelName, huntingSpot, interaction.user.id, start, end, member.guild.id);
            await commandProcessor.clearMessages();
            await commandProcessor.createImage();
            await commandProcessor.createEmbed();
            await commandProcessor.createChart();
            await interaction.editReply({content: `Your reservation ${reservation?.huntingSpot} has been deleted`});
            await interaction.deleteReply();

        } else {
            const replyContent = "No reservation found, nothing has been deleted";
            await interaction.editReply({content: replyContent});
        }

    } catch (error: any) {
        logger.error(error.message);
        console.log(error);
        await interaction.editReply({content: `Something went wrong... ${error.message}`});
    }
};

export default command;