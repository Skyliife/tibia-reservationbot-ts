import {Client, Routes, SlashCommandBuilder} from "discord.js";
import {REST} from "@discordjs/rest";
import {readdirSync} from "fs";
import {join} from "path";
import {SlashCommand} from "../types";
import logger from "../logging/logger";

module.exports = async (client: Client) => {
    const slashCommands: SlashCommandBuilder[] = [];

    let slashCommandsDir = join(__dirname, "../commands");

    readdirSync(slashCommandsDir).forEach((file) => {
        if (!file.endsWith(".js")) return;
        let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
    });

    const rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN);

    // rest
    //     .put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDSERVER), {
    //         body: [],
    //     })
    //     .then(() => {
    //         console.log("Successfully deleted all guild commands.");
    //     })
    //     .catch(console.error);
    //
    // rest.put(Routes.applicationCommands(process.env.CLIENTID), {body: []})
    //     .then(() => console.log('Successfully deleted all application commands.'))
    //     .catch(console.error);


    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDSERVER),
        {
            body: slashCommands.map((command) => command.toJSON()),
        }
    );
    logger.info(`Successfully loaded ${slashCommands.length} slash command(s) for GODS SERVER`);
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDSERVER_REFUGIA),
        {
            body: slashCommands.map((command) => command.toJSON()),
        }
    );
    logger.info(`Successfully loaded ${slashCommands.length} slash command(s) for REFUGIA SERVER`);
};
