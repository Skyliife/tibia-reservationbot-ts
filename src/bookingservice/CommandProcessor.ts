import {AttachmentBuilder, ChannelType, ChatInputCommandInteraction, TextChannel} from "discord.js";
import CollectingService from "./collecting.service";
import VerifyingService from "./verifying.service";
import {
    createOrUpdateStatistics,
    getAllCollectionsAndValues,
    getDataForUserStatistics,
    getResultForGroups,
    getResultForSummary,
    InsertBooking
} from "./database.service";
import {EmbedService} from "./embed.service";
import {ImageService} from "./image.service";
import {getHuntingPlaceByChannelName} from "../huntingplaces/huntingplaces";
import {DatabaseResultForGroup} from "../types";
import {ChartService} from "./chart.service";

//This class processes the command by collecting data, verifying it, and processing it.

export default class CommandProcessor {
    private readonly interaction: ChatInputCommandInteraction;
    private readonly channel: TextChannel;
    private readonly channelName;
    private readonly member;
    private readonly databaseId: string;

    //The constructor takes a ChatInputCommandInteraction as a parameter and assigns it to the interaction property.
    constructor(interaction: ChatInputCommandInteraction) {

        if (interaction.inCachedGuild()) {
            this.interaction = interaction;
            this.channel = interaction.channel as TextChannel;
            this.channelName = this.channel.name;
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
    }

    async clearMessages() {
        await this.channel.messages.fetch({limit: 100}).then(async (msgs) => {
            await this.channel.bulkDelete(msgs, true);
        });
    }

    async createImage() {
        //Get Data from Database
        const data = await this.getDataFromDatabase(this.databaseId);
        //Create Image
        let imageService: ImageService | null = new ImageService();
        let imageAttachment: AttachmentBuilder | null = await imageService.createImage(this.channelName, data);
        await this.channel.send({files: [imageAttachment]});
        //Delete Image
        imageService = null;
        imageAttachment = null;
        console.log("freeing image memory");
    }

    async createEmbed() {
        if (getHuntingPlaceByChannelName(this.channelName) === undefined) return;
        //Get Data from Database
        const data: DatabaseResultForGroup = await getResultForGroups(this.channelName, this.databaseId);
        //Create Embed
        let embedService: EmbedService | null = new EmbedService();
        let embedsForChannel = await embedService.createEmbedsForGroups(data);
        let embedsArray = embedsForChannel.map((item) => item.embed);
        let embedsAttachment = embedsForChannel.map((item) => item.attachment);
        //Send Embed
        if (embedsForChannel.length > 0) {
            await this.channel.send({embeds: embedsArray, files: embedsAttachment});
        }
        //Delete Embed
        embedService = null;
        embedsForChannel = [];
        embedsArray = [];
        embedsAttachment = [];
        console.log("freeing embeds memory");
    }

    async createSummaryChart() {
        //Get Data from Database
        const data = await this.getDataFromDatabase(this.databaseId);
        const data2 = await getResultForSummary(this.databaseId);
        //Create Chart
        let chartService: ChartService | null = new ChartService();
        let chartAttachment: AttachmentBuilder | null = await chartService.createChartForSummary(data, data2);
        //Send Chart
        const channelToSend = this.interaction.guild?.channels.cache.find((channel) => channel.name === "summary") as TextChannel;
        if (channelToSend !== undefined) {
            await channelToSend.bulkDelete(100, true);
            await channelToSend.send({files: [chartAttachment]})
        } else {
            throw new Error("Channel not found");
        }
        //Delete Chart
        chartService = null;
        chartAttachment = null;
        console.log("freeing chart memory");
    }

    async createStatisticsChartForUser(userId: string) {
        //Get Data from Database
        const dataForStatistics = await getDataForUserStatistics(this.interaction, userId, this.databaseId);
        //Create Chart
        const username = this.interaction.client.users.cache.get(userId)?.displayName;
        let chartService: ChartService | null = new ChartService();
        let chartAttachment: AttachmentBuilder | null = await chartService.createChartForStatistics(dataForStatistics, username);
        //Send Chart

        if (this.channelName === "statistics") {
            await this.interaction.editReply({files: [chartAttachment]});
        }
        //Delete Chart
        chartService = null;
        chartAttachment = null;
        console.log("freeing chart memory");
    }

    async updateCommandExecutionCount() {
        await createOrUpdateStatistics(this.interaction, this.interaction.commandName, this.databaseId);
    }

    private async getDataFromDatabase(databaseId: string) {
        return await getAllCollectionsAndValues(databaseId);
    }

}