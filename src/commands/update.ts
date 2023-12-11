import {ChannelType, SlashCommandBuilder} from "discord.js"

import {SlashCommand} from "../types";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("update")
        .setDescription("updates the channel")
    ,
    execute: async interaction => {
        await interaction.reply({
            content: `updated channel`
        })
    },
}

export default command