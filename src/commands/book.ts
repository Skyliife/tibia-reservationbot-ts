import {
    CacheType,
    CacheTypeReducer,
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from "discord.js";
import {SlashCommand} from "../types";
import BookingService from "../bookingservice/booking.service";
import logger from "../logging/logger";
import {createEmbedsForGroups} from "../bookingservice/embed.service";
import {getChoicesForDate, getChoicesForTime} from "../utils";
import {getChoicesForSpot, getHuntingPlaceByName} from "../huntingplaces/huntingplaces";
import {GuildRoles} from "../enums";

const optionNames = {
    spot: "spot",
    date: "date",
    start: "start",
    end: "end",
    name: "name",
};

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("book")
        .addStringOption((option) => option.setName(optionNames.spot).setDescription("Select the spot").setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option.setName(optionNames.date).setDescription("Select a date").setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option.setName(optionNames.start).setDescription("Select a start time").setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option.setName(optionNames.end).setDescription("Select an end time").setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option.setName(optionNames.name).setDescription("Select a name or leave empty"))
        .setDescription("Book a hunting ground"),

    autocomplete: async (interaction) => {
        const channel = interaction.channel;
        const channelName = fetchChannelName(channel);

        try {
            const focusedValue = interaction.options.getFocused();
            const focusedValue2 = interaction.options.getFocused(true);

            let choices: { name: string; value: string }[] = [];

            switch (focusedValue2.name) {
                case optionNames.spot: {
                    choices = getChoicesForSpot(channelName);
                    break;
                }
                case optionNames.date: {
                    choices = getChoicesForDate(interaction);
                    break;
                }
                case optionNames.start:
                case optionNames.end: {
                    choices = getChoicesForTime();
                    break;
                }
            }

            const filtered = choices.filter((choice) => choice.name.includes(focusedValue));

            await interaction.respond(filtered);
        } catch (error) {
            logger.error(`Error: ${error}`);
        }
    },

    execute: async (interaction: ChatInputCommandInteraction) => {
        logger.debug("Start executing /book command!");

        const channel = interaction.channel;
        const channelName = fetchChannelName(channel);
        const rolePriority = [
            GuildRoles.GodsMember,
            GuildRoles.Gods,
            GuildRoles.Bazant,
            GuildRoles.VIP,
            GuildRoles.Verified,
        ];


        try {
            await interaction.deferReply({ephemeral: true});
            const member: CacheTypeReducer<CacheType, GuildMember, any> = interaction.member;
            const hasRequiredRole = rolePriority.some((roleToCheck) => member.roles.cache.some((role: any) => role.name === roleToCheck));

            if (!hasRequiredRole) {
                throw new Error("You don't have permission to use the bot commands");

            }

            if (channelName !== undefined) {
                const isCommandUsedInRightChannel = getHuntingPlaceByName(channelName);
                if (!isCommandUsedInRightChannel) {
                    throw new Error("The \"/book command\" can only be used in hunting channels");
                }
            }

            if (!interaction.options) {
                logger.error("Interaction Options are null/undefined");
                return await interaction.editReply({content: "Something went wrong..."});
            }

            await interaction.editReply({
                content: "Try to book your reservation",
            });

            const book = new BookingService(interaction);
            const bookedReservation = await book.tryCreateBooking();

            if (bookedReservation.isBooked) {
                await interaction.channel?.messages.fetch({limit: 100}).then(async (msgs) => {
                    if (interaction.channel?.type === ChannelType.DM) return;
                    await interaction.channel?.bulkDelete(msgs, true);
                });

                await interaction.editReply({
                    content: `${bookedReservation.displayBookingInfo}`,
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
            }
        } catch (error: any) {
            logger.error(error.message);
            console.log(error);
            await interaction.editReply({content: `Something went wrong...${error.message}`});
        }
    },
};

const fetchChannelName = (channel: any): string | undefined => {
    return channel?.name;
};

export default command;