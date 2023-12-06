import {ChannelType, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {SlashCommand} from "../types";
import BookingService from "../bookingservice/booking.service";
import logger from "../logging/logger";
import {createEmbedsForGroups} from "../bookingservice/embed.service";
import {getChoicesForDate, getChoicesForTime} from "../utils";
import {getChoicesForSpot} from "../huntingplaces/huntingplaces";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("book")
        .addStringOption((option) => {
            return option
                .setName("spot")
                .setDescription("select the spot")
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName("date")
                .setDescription("select a date")
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName("start")
                .setDescription("select a start time")
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName("end")
                .setDescription("select a end time")
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option.setName("name").setDescription("select a name or leave empty");
        })
        .setDescription("book a hunting ground"),

    autocomplete: async (interaction) => {
        const channel = interaction.channel;
        let channelName;
        if (channel && "name" in channel) {
            channelName = channel.name;
        }
        let choices: { name: string; value: string }[] = [];
        const spot = "spot";
        const date = "date";
        const start = "start";
        const end = "end";
        try {
            const focusedValue = interaction.options.getFocused();
            const focusedValue2 = interaction.options.getFocused(true);

            switch (focusedValue2.name) {
                case spot: {
                    choices = getChoicesForSpot(channelName);
                    console.log(choices);
                    break;
                }
                case date: {
                    choices = getChoicesForDate(interaction);
                    break;
                }
                case start:
                case end: {
                    choices = getChoicesForTime();
                    break;
                }
            }

            let filtered: { name: string; value: string }[] = [];
            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                if (choice.name.includes(focusedValue)) filtered.push(choice);
            }
            console.log("focusedValue2", focusedValue2);
            await interaction.respond(filtered);

        } catch (error) {
            logger.error(`Error: ${error}`);
        }
    },
    execute: async (interaction: ChatInputCommandInteraction) => {
        logger.debug("Start executing /book command!");
        const channel = interaction.channel;
        let channelName;
        if (channel && "name" in channel) {
            channelName = channel.name;
        }
        try {
            await interaction.deferReply({ephemeral: true});

            if (!interaction.options) {
                logger.error("Interaction Options are null/undefined");
                return await interaction.editReply({content: "Something went wrong..."});
            }

            await interaction.editReply({
                content: "try to book your reservation",
            });

            const book = new BookingService(interaction);
            const bookedReservation = await book.tryCreateBooking();
            if (bookedReservation.isBooked) {
                interaction.channel?.messages.fetch({limit: 100}).then(async (msgs) => {
                    if (interaction.channel?.type === ChannelType.DM) return;
                    await interaction.channel?.bulkDelete(msgs, true);
                });
                await interaction.editReply({
                    content: `${bookedReservation.displayBookingInfo}`,
                });
                const embedsForChannel = await createEmbedsForGroups(channelName);
                const embedsArray = embedsForChannel.map((item) => item.embed);
                const embedsAttachment = embedsForChannel.map((item) => item.attachment);
                interaction.followUp({
                    embeds: embedsArray,
                    files: embedsAttachment,
                });
            }
        } catch (error: any) {
            logger.error(error.message);
            console.log(error);
            await interaction.editReply({content: `Something went wrong...${error.message}`});
        }
    },
};

export default command;
