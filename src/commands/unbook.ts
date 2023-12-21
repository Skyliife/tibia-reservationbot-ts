import {ChannelType, GuildMember, SlashCommandBuilder, TextChannel} from "discord.js";
import {IBooking, SlashCommand} from "../types";
import {deleteBookingsForUserId, getCurrentBookingsForUserId} from "../bookingservice/database.service";
import logger from "../logging/logger";
import CommandProcessor from "../bookingservice/CommandProcessor";

let choices: { formattedString: string; reservation: IBooking | null }[] = [];

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("unbook")
        .setNameLocalizations({
            pl: "anuluj",
            de: "stornieren",
            'es-ES': 'cancelar',
        })
        .addStringOption((option) => {
            return option
                .setName("reservation")
                .setNameLocalizations({
                    pl: "rezerwacja",
                    de: "reservierung",
                    'es-ES': 'reserva',
                })
                .setDescription("Select a reservation to delete")
                .setDescriptionLocalizations({
                    pl: 'wybierz rezerwację do usunięcia',
                    de: 'wähle eine reservierung zum löschen',
                    'es-ES': 'elige la reserva que desea eliminar',
                })
                .setRequired(true)
                .setAutocomplete(true);
        })
        .setDescription("cancel a booking")
        .setDescriptionLocalizations({
            pl: 'anulowanie rezerwacji',
            de: 'eine buchung stornieren',
            'es-ES': 'cancelar una reserva',
        }),

    autocomplete: async (interaction) => {
        const channel = interaction.channel;
        const channelName = fetchChannelName(channel);
        const member = interaction.member as GuildMember

        await fetchAndSetChoices(channelName, interaction.user.id, member.guild.id);

        await interaction.respond(generateAutocompleteChoices(choices));
    },

    execute: async (interaction) => {
        logger.debug("Start executing /unbook command!");
        let commandProcessor: CommandProcessor | null = new CommandProcessor(interaction);
        const input = interaction.options.getString("reservation");
        const dataToDelete = choices.find((choice) => choice.formattedString === input);

        try {
            await interaction.deferReply({ephemeral: true});

            if (dataToDelete && interaction.inCachedGuild() && dataToDelete.reservation !== null) {
                const channel = interaction.channel as TextChannel;
                const channelName = channel.name;
                const {reservation} = dataToDelete;

                const huntingSpot = reservation.huntingSpot;
                const start = reservation.start;
                const end = reservation.end;
                const member = await interaction.guild.members.fetch(interaction.user.id);


                await deleteBookingsForUserId(channelName, huntingSpot, interaction.user.id, start, end, member.guild.id);
                await commandProcessor.clearMessages();
                await commandProcessor.createImage();
                await commandProcessor.createEmbed();
                await commandProcessor.createSummaryChart();
                await interaction.editReply({content: `Your reservation ${reservation.huntingSpot} has been deleted`});
                await interaction.deleteReply();
                commandProcessor = null;
                choices = [];

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
        let data: {
            formattedString: string;
            reservation: IBooking
        }[] | null = await getCurrentBookingsForUserId(channelName, userId, databaseId);
        if (data.length === 0) {
            choices = [{formattedString: "No reservation found", reservation: null}];
        }
        choices = data;
        data = null;
    } catch (error: any) {
        logger.error(error.message);
    }
};

export default command;