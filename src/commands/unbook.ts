import {
    CacheType,
    CacheTypeReducer,
    ChannelType,
    ChatInputCommandInteraction, GuildMember,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import {IBooking, SlashCommand} from "../types";
import {deleteBookingsForUserId, getBookingsForUserId} from "../bookingservice/database.service";
import {createEmbedsForGroups} from "../bookingservice/embed.service";
import logger from "../logging/logger";
import {createChart} from "../bookingservice/chart.service";

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

        await fetchAndSetChoices(channelName, interaction.user.id);

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

const fetchAndSetChoices = async (channelName: string | undefined, userId: string) => {
    try {
        choices = await getBookingsForUserId(channelName, userId);
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
    const channelName = fetchChannelName(interaction.channel);
    const huntingSpot = dataToDelete.reservation?.huntingSpot;
    const start = dataToDelete.reservation?.start;
    const end = dataToDelete.reservation?.end;
    const member: CacheTypeReducer<CacheType, GuildMember, any> = interaction.member;

    if (huntingSpot !== undefined && channelName !== undefined && start !== undefined && end !== undefined) {
        await deleteBookingsForUserId(channelName, huntingSpot, interaction.user.id, start, end);

        await interaction.channel?.messages.fetch({limit: 100}).then(async (msgs) => {
            if (interaction.channel?.type === ChannelType.DM) return;
            await interaction.channel?.bulkDelete(msgs, true);
        });
        await createChart();
        const channelToSend = member.guild.channels.cache.find((channel:any) => channel.name === "summary") as TextChannel;
        if (channelToSend !== undefined) {
            await channelToSend.bulkDelete(100, true);
            await channelToSend.send({files: [{attachment: '../tibia-reservationbot-ts/build/img/currentCapacities.png'}]})
        }
        await interaction.editReply({
            content: `Your reservation ${dataToDelete.reservation?.huntingSpot} has been deleted`,
        });

        const embedsForChannel = await createEmbedsForGroups(channelName);
        const embedsArray = embedsForChannel.map((item) => item.embed);
        const embedsAttachment = embedsForChannel.map((item) => item.attachment);

        if (embedsForChannel.length > 0) {
            await interaction.followUp({
                embeds: embedsArray,
                files: embedsAttachment,
            });
        }
    } else {
        await interaction.editReply({
            content: `No reservation found, nothing has been deleted`,
        });
    }
};

export default command;
