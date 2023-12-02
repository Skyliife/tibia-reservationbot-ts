import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from "../types";
import BookingService from "../bookingservice/booking.service";
import logger from "../logging/logger";

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
    try {
      const focusedValue = interaction.options.getFocused();
      // we need database values here to display the hunting grounds, dates and aviable times, in choices array!!!!
      const choices = [
        { name: "spot", value: "testSpot" },
        { name: "date", value: "testDate" },
        { name: "start", value: "testStart" },
        { name: "end", value: "testEnd" },
      ];
      let filtered: { name: string; value: string }[] = [];
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.name.includes(focusedValue)) filtered.push(choice);
      }
    } catch (error) {
      logger.error(`Error: ${error}`);
    }
  },
  execute: async (interaction: ChatInputCommandInteraction) => {
    logger.debug("Start executing /book command!");
    try {
      await interaction.deferReply({ ephemeral: true });

      if (!interaction.options) {
        console.log('ASD');
        logger.error("Interaction Options are null/undefined");
        return interaction.editReply({ content: "Something went wrong..." });
      }

      await interaction.editReply({
        content: "try to book your reservation",
      });

      if (interaction) {
        const book = new BookingService(interaction as ChatInputCommandInteraction);
      }
      await interaction.editReply({
        content: "your reservation has been booked",
      });

    } catch (error) {
      logger.error(error);
      interaction.editReply({ content: "Something went wrong..." });
    }
  },
};

export default command;
