import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("book").setDescription("book a huntingground"),
  execute: (interaction) => {
    interaction.reply({
      content: "Pong",
    });
  },
};

export default command;
