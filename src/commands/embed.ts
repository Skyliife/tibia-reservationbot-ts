import {ChannelType, GuildMember, SlashCommandBuilder, TextChannel} from "discord.js";

import {SlashCommand} from "../types";
import {createEmbedsForGroups} from "../bookingservice/embed.service";
import {createChart} from "../bookingservice/chart.service";
import {ImageService} from "../bookingservice/image.service";

const command: SlashCommand = {
    command: new SlashCommandBuilder().setName("embed").setDescription("test embed"),
    execute: async (interaction) => {
        await interaction.deferReply({ephemeral: true});
        const channel = interaction.channel;
        await interaction.followUp({
            content: "Done",
        });



        let channelName;
        if (channel && "name" in channel) {
            channelName = channel.name;
        }
        const member = interaction.member as GuildMember;
        interaction.channel?.messages.fetch({limit: 100}).then(async (msgs) => {
            if (interaction.channel?.type === ChannelType.DM) return;
            const deletedMessages = await interaction.channel?.bulkDelete(msgs, true);
        });


        await createChart(member.guild.id);
        if (interaction.inCachedGuild()) {
            const channelToSend = member.guild.channels.cache.find((channel: any) => channel.name === "summary") as TextChannel;
            if (channelToSend !== undefined) {
                await channelToSend.bulkDelete(100, true);
                await channelToSend.send({files: [{attachment: '../tibia-reservationbot-ts/build/img/summary.png'}]})
            }
        }

        await ImageService(interaction);
        const embedsForChannel = await createEmbedsForGroups(channelName, member.guild.id);
        const embedsArray = embedsForChannel.map((item) => item.embed);
        const embedsAttachment = embedsForChannel.map((item) => item.attachment);
        if (embedsForChannel.length > 0) {
            await interaction.followUp({
                embeds: embedsArray,
                files: embedsAttachment,
            });
        }
    },
};

export default command;
