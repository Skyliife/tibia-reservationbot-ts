import {Client, Collection, GatewayIntentBits, PermissionFlagsBits} from "discord.js";
import {SlashCommand} from "./types";
import {config} from "dotenv";
import {readdirSync} from "fs";
import {join} from "path";

const {Guilds, MessageContent, GuildMessages, GuildMembers} = GatewayIntentBits;

config();

const client = new Client({
    intents: [Guilds],
});

client.slashCommands = new Collection<string, SlashCommand>();

const handlersDir = join(__dirname, "./handler");
readdirSync(handlersDir).forEach((handler) => {
    if (!handler.endsWith(".js")) return;
    require(`${handlersDir}/${handler}`)(client);
});

client.login(process.env.DISCORD_TOKEN);
