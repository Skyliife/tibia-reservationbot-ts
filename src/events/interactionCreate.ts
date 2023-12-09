
import { Interaction, Events } from "discord.js";
import { Event } from "../types";

const event: Event = {
  name: Events.InteractionCreate,
  execute: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.slashCommands.get(interaction.commandName);

      if (!command) return;

      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.slashCommands.get(interaction.commandName);
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      try {
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  },
};

export default event;
