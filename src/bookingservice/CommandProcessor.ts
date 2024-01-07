import {AttachmentBuilder, ChannelType, ChatInputCommandInteraction, TextChannel} from "discord.js";
import CollectingService from "./collecting.service";
import VerifyingService from "./verifying.service";
import {EmbedService} from "./embed.service";
import {ImageService} from "./image.service";
import {getHuntingPlaceByChannelName} from "../huntingplaces/huntingplaces";
import {DatabaseResultForGroup, IBooking, Reclaim} from "../types";
import {ChartService} from "./chart.service";
import {DatabaseService} from "./database.service";
import {GuildRoles} from "../enums";

//This class processes the command by collecting data, verifying it, and processing it.

export default class CommandProcessor {
    private readonly interaction: ChatInputCommandInteraction;
    private readonly channel: TextChannel;
    private readonly channelName;
    private readonly member;
    private readonly databaseId: string;
    private databaseService;

    //The constructor takes a ChatInputCommandInteraction as a parameter and assigns it to the interaction property.
    constructor(interaction: ChatInputCommandInteraction) {

        if (interaction.inCachedGuild()) {
            this.interaction = interaction;
            this.channel = interaction.channel as TextChannel;
            this.channelName = this.channel.name;
            this.member = interaction.member;
            this.databaseId = interaction.guild.id;
            this.databaseService = new DatabaseService(this.databaseId);
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
        await this.databaseService.enqueueReservation(verifiedData.booking);
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
        console.log("freeing image");
    }

    async createEmbed() {
        if (getHuntingPlaceByChannelName(this.channelName) === undefined) return;
        //Get Data from Database
        const data: DatabaseResultForGroup = await this.databaseService.getResultForGroups(this.channelName);
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
        console.log("freeing embeds");
    }

    async createSummaryChart() {
        //Get Data from Database
        const data = await this.getDataFromDatabase(this.databaseId);
        const data2 = await this.databaseService.getResultForSummary();
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
        console.log("freeing chart");
    }

    async createStatisticsChartForUser(userId: string) {
        //Get Data from Database
        const dataForStatistics = await this.databaseService.getDataForUserStatistics(this.interaction, userId);
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
        console.log("freeing chart");
    }

    async updateCommandExecutionCount() {
        await this.databaseService.createOrUpdateStatistics(this.interaction, this.interaction.commandName);
    }

    async deleteBooking(dataToDelete: { formattedString: string, reservation: IBooking | null }) {
        const {reservation} = dataToDelete;
        if (reservation) {
            const huntingSpot = reservation.huntingSpot;
            const start = reservation.start;
            const end = reservation.end;
            const id = this.interaction.user.id.toString()
            await this.databaseService.tryDeleteOrUpdateBooking(this.channelName, huntingSpot, id, start, end);
        }
    }

    async reclaimBooking(dataToReclaim: {
        formattedString: string;
        reservationToClaim: IBooking | null
    }, reclaimer: Reclaim) {
        const {reservationToClaim} = dataToReclaim;
        let duration = 120;
        if (reservationToClaim) {
            const role = this.member.roles.highest.name as GuildRoles;

            if (role === GuildRoles.Bazant || role === GuildRoles.GodsMember || role === GuildRoles.Gods) {
                duration = 180;
            }
            await this.databaseService.tryReclaimBooking(this.channelName, reservationToClaim, reclaimer, duration);
        }
    }

    private async getDataFromDatabase(databaseId: string) {
        return await this.databaseService.getAllCollectionsAndValues();
    }
}