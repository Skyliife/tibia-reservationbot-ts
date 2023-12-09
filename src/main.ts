import {Client, Collection, GatewayIntentBits, PermissionFlagsBits} from "discord.js";
import {SlashCommand} from "./types";
import {config} from "dotenv";
import {readdirSync} from "fs";
import {join} from "path";

const {Guilds, MessageContent, GuildMessages, GuildMembers} = GatewayIntentBits;
const client = new Client({
    intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
});

try {
    config();

    const client = new Client({
        intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
    });

    client.slashCommands = new Collection<string, SlashCommand>();

    const handlersDir = join(__dirname, "./handler");
    readdirSync(handlersDir).forEach((handler) => {
        if (!handler.endsWith(".js")) return;
        require(`${handlersDir}/${handler}`)(client);
    });

    client.login(process.env.DISCORD_TOKEN);
} catch (error:any) {
    console.error("An error occurred during initialization:", error.message);
    // You can add additional error handling or cleanup code here if needed
}