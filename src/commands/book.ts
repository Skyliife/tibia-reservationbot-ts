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


const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("book")
        .setNameLocalizations({
            pl: "rezerwacja",
            de: "reservierung",
            'es-ES': 'reserva',
        })
        .addStringOption((option) => {
            return option
                .setName(optionNames.spot)
                .setNameLocalizations({
                    pl: optionNamesPL.spot,
                    de: optionNamesDE.spot,
                    'es-ES': optionNamesES.spot,
                })
                .setDescription(description.spot)
                .setDescriptionLocalizations({
                    pl: descriptionPL.spot,
                    de: descriptionDE.spot,
                    'es-ES': descriptionES.spot,
                })
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName(optionNames.date)
                .setNameLocalizations({
                    pl: optionNamesPL.date,
                    de: optionNamesDE.date,
                    'es-ES': optionNamesES.date,
                })
                .setDescription(description.date)
                .setDescriptionLocalizations({
                    pl: descriptionPL.date,
                    de: descriptionDE.date,
                    'es-ES': descriptionES.date,
                })
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName(optionNames.start)
                .setNameLocalizations({
                    pl: optionNamesPL.start,
                    de: optionNamesDE.start,
                    'es-ES': optionNamesES.start,
                })
                .setDescription(description.start)
                .setDescriptionLocalizations({
                    pl: descriptionPL.start,
                    de: descriptionDE.start,
                    'es-ES': descriptionES.start,
                })
                .setRequired(true)
                .setAutocomplete(true);
        })
        .addStringOption((option) => {
            return option
                .setName(optionNames.end)
                .setNameLocalizations({
                    pl: optionNamesPL.end,
                    de: optionNamesDE.end,
                    'es-ES': optionNamesES.end,
                })
                .setDescription(description.end)
                .setDescriptionLocalizations({
                    pl: descriptionPL.end,
                    de: descriptionDE.end,
                    'es-ES': descriptionES.end,
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
        .setDescription(description.command)
        .setDescriptionLocalizations({
            pl: descriptionPL.command,
            de: descriptionDE.command,
            'es-ES': descriptionES.command,
        }),

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
        try {
            await interaction.deferReply({ephemeral: true});
            let commandProcessor: CommandProcessor | null = new CommandProcessor(interaction);
            //Step1: Collect data
            const data = commandProcessor.collectData();
            //Step2: Verify data
            const verifiedData = commandProcessor.verifyData(data);
            //Step3: Process data to database
            await commandProcessor.processData(verifiedData);
            await commandProcessor.clearMessages();
            await commandProcessor.createImage();
            await commandProcessor.createEmbed();
            await commandProcessor.createSummaryChart();
            await commandProcessor.updateCommandExecutionCount();
            await interaction.editReply({content: `${verifiedData.booking.displayBookingInfo()}!`});
            await interaction.deleteReply();
            commandProcessor = null;

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