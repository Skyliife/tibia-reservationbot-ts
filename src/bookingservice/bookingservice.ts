import { ChatInputCommandInteraction } from "discord.js";

class BookingService {
  private bookings: Booking[] = [];
  private options: { [key: string]: string | number | boolean } = {};

  /**
   *
   */
  constructor(interaction: ChatInputCommandInteraction) {
    for (let i = 0; i < interaction.options.data.length; i++) {
      const element = interaction.options.data[i];
      if (element.name && element.value) this.options[element.name] = element.value;
    }
  }
}

export default BookingService;
