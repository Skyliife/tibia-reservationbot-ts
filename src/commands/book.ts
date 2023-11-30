import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import BookingService from "../bookingservice/bookingservice";
import logger from "../logging/logger";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("book").setDescription("book a hunting ground"),
  autocomplete: async (interaction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      const choices = [{ name: "test", value: "test" }];
      let filtered: { name: string; value: string }[] = [];
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.name.includes(focusedValue)) filtered.push(choice);
      }
    } catch (error) {
      logger.error(`Error: ${error}`);
    }
  },
  execute: async (interaction) => {
    logger.info("Start executing /book command!");
    try {
      await interaction.deferReply({ ephemeral: true });
      if (!interaction.options) {
        logger.error("Interaction Options are null/undefined");
        return interaction.editReply({ content: "Something went wrong..." });
      }

      const bookingService = new BookingService(interaction);
      interaction.reply({
        content: "Pong",
      });
    } catch (error) {
      logger.error(error);
      interaction.editReply({ content: "Something went wrong..." });
    }
  },
};

export default command;
