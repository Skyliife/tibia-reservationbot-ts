import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Event } from "../types";
import logger from "../logging/logger";

module.exports = (client: Client) => {
  let eventsDir = join(__dirname, "../events");

  readdirSync(eventsDir).forEach((file) => {
    if (!file.endsWith(".js")) return;
    let event: Event = require(`${eventsDir}/${file}`).default;
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args));
    logger.info(`Successfully loaded event ${event.name}`);
  });
};
