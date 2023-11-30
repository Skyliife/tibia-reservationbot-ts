import { Client } from "discord.js";
import { Event } from "../types";
import logger from "../logging/logger";

const event: Event = {
  name: "ready",
  once: true,
  execute: (client: Client) => {
    logger.info(`Logged in as ${client.user?.tag}`);
    client.destroy()
    logger.info(`${client.user?.tag} logged out: comment out in ready.ts for development`);
    process.exit(0)
  },
};

export default event;
