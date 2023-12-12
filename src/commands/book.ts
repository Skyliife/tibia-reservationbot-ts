import {
    AutocompleteInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";
import {SlashCommand} from "../types";
import logger from "../logging/logger";
import {getChoicesForDate, getChoicesForTime} from "../utils";
import {getChoicesForSpot} from "../huntingplaces/huntingplaces";
import CommandProcessor from "../bookingservice/CommandProcessor";

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
        .addStringOption((option) => option.setName(optionNames.name).setDescription("Select a name or leave empty").setMaxLength(15))
        .setDescription("Book a hunting ground"),

    autocomplete: async (interaction) => {

        const channelName = await fetchChannel(interaction);

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
        const commandProcessor = new CommandProcessor(interaction);
        try {
            await interaction.deferReply({ephemeral: true});
            //Step1: Collect data
            const data = commandProcessor.collectData();
            //Step2: Verify data
            const verifiedData = commandProcessor.verifyData(data);
            //Step3: Process data to database
            await commandProcessor.processData(verifiedData);
            await commandProcessor.clearMessages();
            await commandProcessor.createImage();
            await commandProcessor.createEmbed();
            await commandProcessor.createChart();
            await interaction.editReply({content: `${verifiedData.booking.displayBookingInfo()}!`});
            await interaction.deleteReply();
        } catch (error: any) {
            logger.error(error.message);
            console.log(error);
            await interaction.editReply({content: `Something went wrong... ${error.message}`});
        }
    },
};

const fetchChannel = async (interaction: ChatInputCommandInteraction | AutocompleteInteraction) => {
    const channel = interaction.channel as TextChannel;
    return channel.name;
};
export default command;