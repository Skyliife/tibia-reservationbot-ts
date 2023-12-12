import {AttachmentBuilder, ChannelType, ChatInputCommandInteraction, GuildMember, TextChannel} from "discord.js";
import CollectingService from "./collecting.service";
import VerifyingService from "./verifying.service";
import {InsertBooking} from "./database.service";
import {createEmbedsForGroups} from "./embed.service";
import {createChart} from "./chart.service";
import {ImageService} from "./image.service";

//This class processes the command by collecting data, verifying it, and processing it.

class CommandProcessor {
    private readonly interaction: ChatInputCommandInteraction;
    private readonly channelName;
    private readonly member;

    //The constructor takes a ChatInputCommandInteraction as a parameter and assigns it to the interaction property.
    constructor(interaction: ChatInputCommandInteraction) {
        this.interaction = interaction;
        this.channelName = (interaction.channel as TextChannel).name;
        this.member = interaction.member as GuildMember;
    }

    collectData(): CollectingService {
        return new CollectingService(this.interaction);
    }

    verifyData(data: CollectingService): VerifyingService {
        return new VerifyingService(data);
    }

    async processData(verifiedData: VerifyingService) {
        await InsertBooking(verifiedData.booking, this.member.guild.id);
        await this.interaction.editReply({content: verifiedData.booking.displayBookingInfo()});

        //await new Promise(resolve => setTimeout(resolve, 5000));


    }

    async clearMessages() {
        await this.interaction.channel?.messages.fetch({limit: 100}).then(async (msgs) => {
            if (this.interaction.channel?.type === ChannelType.DM) return;
            await this.interaction.channel?.bulkDelete(msgs, true);
        });
    }

    async createImage() {
        await ImageService(this.interaction);
    }

    async createEmbed() {

        const embedsForChannel = await createEmbedsForGroups(this.channelName, this.member.guild.id);
        const embedsArray = embedsForChannel.map((item) => item.embed);
        const embedsAttachment = embedsForChannel.map((item) => item.attachment);


        if (embedsForChannel.length > 0) {
            // await this.interaction.followUp({
            //     embeds: embedsArray,
            //     files: embedsAttachment,
            // });
            const channelToSend = this.interaction.channel as TextChannel;
            await channelToSend.send({embeds: embedsArray, files: embedsAttachment});
        }
    }

    async createChart() {

        const canvas = await createChart(this.member.guild.id);
        if (this.interaction.inCachedGuild()) {
            const channelToSend = this.member.guild.channels.cache.find((channel: any) => channel.name === "summary") as TextChannel;
            if (channelToSend !== undefined) {
                await channelToSend.bulkDelete(100, true);
                const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'summary.png'});
                await channelToSend.send({files: [attachment]})
            }
        }


    }


}

export default CommandProcessor;