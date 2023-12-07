import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { getBookingsForUserId } from "../bookingservice/database.service";
import dayjs from "dayjs";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("unbook")
    .addStringOption((option) => {
      return option
        .setName("reservation")
        .setDescription("select a reservation to delete")
        .setRequired(true)
        .setAutocomplete(true);
    })
    .setDescription("delete a reservations"),
  autocomplete: async (interaction) => {
    const focusedValue = interaction.options.getFocused();
    const channel = interaction.channel;
    let channelName;
    if (channel && "name" in channel) {
      channelName = channel.name;
    }
    let choices: { name: string; value: string }[] = [];
    try {
      const currentBookings = await getBookingsForUserId(channelName, interaction.user.id);
      currentBookings?.map((booking) => {
        const reservation = `${dayjs(booking.start).format("D.M")} ${
          booking.huntingSpot
        } from ${dayjs(booking.start).format("HH:mm")} to ${dayjs(booking.end).format("HH:mm")}`;

        choices.push({ name: reservation, value: reservation });
      });
      let filtered: { name: string; value: string }[] = [];
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.name.includes(focusedValue)) filtered.push(choice);
      }
      await interaction.respond(filtered);
    } catch (error: any) {
      console.log(error.message);
    }
  },

  execute: async (interaction) => {
    await interaction.reply({
      content: "hi",
    });
  },
};

export default command;
