import {ChannelType, GuildMember, SlashCommandBuilder} from "discord.js";
import {IBooking, Reclaim, SlashCommand} from "../types";
import CommandProcessor from "../bookingservice/CommandProcessor";
import {getBookingsToReclaim} from "../bookingservice/database.service";
import dayjs from "dayjs";
import {
    description,
    descriptionDE,
    descriptionES,
    descriptionPL,
    optionNames,
    optionNamesDE,
    optionNamesES,
    optionNamesPL
} from "../locale/locales/optionnames";


let choices: { formattedString: string; reservationToClaim: IBooking | null }[] = [];

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("reclaim")
        .setNameLocalizations({
            pl: "reclaim",
            de: "reclaim",
            'es-ES': 'reclaim',
        })
        .addStringOption((option) => {
            return option
                .setName("reservation")
                .setNameLocalizations({
                    pl: "rezerwacja",
                    de: "reservierung",
                    'es-ES': 'reserva',
                })
                .setDescription("Select a reservation to reclaim")
                .setDescriptionLocalizations({
                    pl: 'Select a reservation to reclaim',
                    de: 'Select a reservation to reclaim',
                    'es-ES': 'Select a reservation to reclaim',
                })
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName("reason")
                .setNameLocalizations({
                    pl: "reason",
                    de: "reason",
                    'es-ES': 'reason',
                })
                .setDescription("provide a reason for reclaiming")
                .setDescriptionLocalizations({
                    pl: 'provide a reason for reclaiming',
                    de: 'provide a reason for reclaiming',
                    'es-ES': 'provide a reason for reclaiming',
                })
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName(optionNames.name)
                .setNameLocalizations({
                    pl: optionNamesPL.name,
                    de: optionNamesDE.name,
                    'es-ES': optionNamesES.name,
                })
                .setDescription(description.name)
                .setDescriptionLocalizations({
                    pl: descriptionPL.name,
                    de: descriptionDE.name,
                    'es-ES': descriptionES.name,
                })
                .setMaxLength(15);
        })
        .setDescription("reclaim a booking")
        .setDescriptionLocalizations({
            pl: 'reclaim a booking',
            de: 'reclaim a booking',
            'es-ES': 'reclaim a booking',
        }),

    autocomplete: async (interaction) => {
        const channel = interaction.channel;
        const channelName = fetchChannelName(channel);
        const member = interaction.member as GuildMember

        await fetchAndSetChoices(channelName, interaction.user.id, member.guild.id);

        await interaction.respond(generateAutocompleteChoices(choices));
    },

    execute: async (interaction) => {
        console.log("Start executing /reclaim command!");
        let commandProcessor: CommandProcessor | null = new CommandProcessor(interaction);
        const input = interaction.options.getString("reservation");
        const dataToReclaim = choices.find((choice) => choice.formattedString === input);

        try {
            await interaction.deferReply({ephemeral: true});


            if (dataToReclaim && interaction.inCachedGuild() && dataToReclaim.reservationToClaim !== null) {
                const reclaimer: Reclaim = {
                    isReclaim: true,
                    reclaimId: interaction.user.id,
                    reclaimedBy: {
                        userInputName: interaction.options.getString(optionNames.name) ?? "",
                        displayName: interaction.user.displayName ?? "",
                        guildNickName: interaction.guild.members.cache.get(interaction.user.id)?.nickname ?? "",
                        globalName: interaction.user.globalName ?? "",
                        interactionName: interaction.user.username ?? "",
                    },
                    reclaimedAt: dayjs(),
                    reclaimedMessage: interaction.id,
                };
                await commandProcessor.reclaimBooking(dataToReclaim, reclaimer);
                await commandProcessor.clearMessages();
                await commandProcessor.createImage();
                await commandProcessor.createEmbed();
                await commandProcessor.createSummaryChart();
                await interaction.editReply({content: `Reservation ${dataToReclaim.reservationToClaim.huntingSpot} has been reclaimed`});
                await interaction.deleteReply();
                commandProcessor = null;
                choices = [];

            } else {
                await interaction.editReply({
                    content: `No reclaim found, nothing has been reclaimed`,
                });
            }
        } catch (error: any) {
            console.log(error);
            await interaction.editReply({
                content: `${error.message}`,
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
            reservationToClaim: IBooking
        }[] | null = await getBookingsToReclaim(channelName, userId, databaseId);
        if (data.length === 0) {
            choices = [{formattedString: "No reclaim found", reservationToClaim: null}];
        }
        choices = data;
        data = null;
    } catch (error: any) {
        console.error(error.message);
    }
};

export default command;