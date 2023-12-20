import {AttachmentBuilder, ChannelType, ChatInputCommandInteraction, TextChannel} from "discord.js";
import CollectingService from "./collecting.service";
import VerifyingService from "./verifying.service";
import {
    createOrUpdateStatistics,
    getAllCollectionsAndValues,
    getDataForHuntingPlaceStatistics,
    getDataForUserStatistics,
    getResultForSummary,
    InsertBooking
} from "./database.service";
import {createEmbedsForGroups} from "./embed.service";
import {createChartForStatistics, createChartForSummary} from "./chart.service";
import {ImageService} from "./image.service";
import {getHuntingPlaceByChannelName} from "../huntingplaces/huntingplaces";

//This class processes the command by collecting data, verifying it, and processing it.

export default class CommandProcessor {
    private readonly interaction: ChatInputCommandInteraction;
    private readonly channelName;
    private readonly member;
    private readonly databaseId: string;

    //The constructor takes a ChatInputCommandInteraction as a parameter and assigns it to the interaction property.
    constructor(interaction: ChatInputCommandInteraction) {

        if (interaction.inCachedGuild()) {
            this.interaction = interaction;
            const channel = interaction.channel as TextChannel;
            this.channelName = channel.name;
            this.member = interaction.member;
            this.databaseId = interaction.guild.id;
        } else {
            throw new Error("Interaction is not in a cached guild.");
        }
    }

    collectData(): CollectingService {
        return new CollectingService(this.interaction);
    }

    verifyData(data: CollectingService): VerifyingService {
        return new VerifyingService(data);
    }

    async processData(verifiedData: VerifyingService) {
        await InsertBooking(verifiedData.booking, this.databaseId);
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
        const data = await this.getDataFromDatabase(this.databaseId);
        await ImageService(this.interaction, data);
    }

    async createEmbed() {
        if (getHuntingPlaceByChannelName(this.channelName) === undefined) return;
        const embedsForChannel = await createEmbedsForGroups(this.channelName, this.databaseId);
        const embedsArray = embedsForChannel.map((item) => item.embed);
        const embedsAttachment = embedsForChannel.map((item) => item.attachment);
        if (embedsForChannel.length > 0) {
            const channelToSend = this.interaction.channel as TextChannel;
            await channelToSend.send({embeds: embedsArray, files: embedsAttachment});
        }
    }

    async createSummaryChart() {
        const data = await this.getDataFromDatabase(this.databaseId);
        const data2 = await getResultForSummary(this.databaseId);
        const image = await createChartForSummary(data, data2);
        const channelToSend = this.interaction.guild?.channels.cache.find((channel) => channel.name === "summary") as TextChannel;
        if (channelToSend !== undefined) {
            await channelToSend.bulkDelete(100, true);
            const attachment = new AttachmentBuilder(image, {name: 'summary.jpeg'});
            await channelToSend.send({files: [attachment]})
        } else {
            throw new Error("Channel not found");
        }

    }

    async createStatisticsChartForUser(userId: string) {
        const channelForStatistics = this.interaction.channel as TextChannel;
        if (channelForStatistics.name === "statistics") {
            const dataForStatistics = await getDataForUserStatistics(this.interaction, userId, this.databaseId);
            const username = this.interaction.client.users.cache.get(userId)?.displayName;
            const buffer = await createChartForStatistics(dataForStatistics, username);
            const attachment = new AttachmentBuilder(buffer, {name: 'summary.jpeg'});
            await this.interaction.editReply({files: [attachment]});

        }
    }

    async createStatisticsChartForHuntingPlace(channel: TextChannel) {
        const channelForStatistics = this.interaction.channel as TextChannel;
        if (channelForStatistics.name === "statistics") {
            const dataForStatistics = await getDataForHuntingPlaceStatistics(this.interaction, this.databaseId);
            // const canvas = await createChartForStatistics(dataForStatistics);

        }
    }

    async updateCommandExecutionCount() {
        await createOrUpdateStatistics(this.interaction, this.interaction.commandName, this.databaseId);
    }

    private async getDataFromDatabase(databaseId: string) {
        return await getAllCollectionsAndValues(databaseId);
    }

}