import { Client } from "discord.js";
import { Event } from "../types";
import logger from "../logging/logger";

const event: Event = {
  name: "ready",
  once: true,
  execute: (client: Client) => {
    logger.info(`Logged in as ${client.user?.tag}`);
    const isInPipeline = process.env.GITHUB_ACTIONS === 'true';

    if (isInPipeline) {
      // Code specific to the pipeline
      client.destroy();
      logger.info(`${client.user?.tag} logged out in the pipeline`);
      process.exit(0);
    }
  },
};

export default event;
