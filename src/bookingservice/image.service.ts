import {AttachmentBuilder, ChatInputCommandInteraction, GuildMember, TextChannel} from "discord.js";
import {Canvas, createCanvas, loadImage} from "@napi-rs/canvas"
import {request} from "undici";
import {DatabaseResult} from "../types";

const {writeFileSync} = require('fs')
const {join} = require('path')

enum Workload {
    Low = "Low",
    Medium = "Medium",
    High = "High",
}

const applyText = (canvas: Canvas, text: string, width: number) => {
    const context = canvas.getContext('2d');
    let fontSize = 70;

    do {
        context.font = `${fontSize -= 1}px Martel`;
        console.log(context.font);
        console.log(`${context.measureText(text).width} > ${canvas.width - width}`);
    } while (context.measureText(text).width > canvas.width - width);
    console.log("---------------DONE----------------")
    return context.font;
};
const getWorkloadColor = (workload: Workload) => {
    switch (workload) {
        case Workload.Low:
            return '#00ff00'; // Green for Low
        case Workload.Medium:
            return '#ffff00'; // Yellow for Medium
        case Workload.High:
            return '#ff0000'; // Red for High
        default:
            return '#ffffff'; // Default color
    }
};

export const ImageService = async (interaction: ChatInputCommandInteraction, data: DatabaseResult) => {
    const channel = interaction.channel as TextChannel
    const counts: { [key: string]: number } = {};
    Object.keys(data).forEach((huntingPlace) => {
        if (data[huntingPlace].length === 0) return;
        counts[huntingPlace] = data[huntingPlace].length;
    });
    const values = Object.keys(counts).map((key, index) => {
        const amount = counts[key];
        return {label: key, value: amount};
    });
    const resultObject = values.find((obj) => obj.label === channel.name);


    const member = interaction.member as GuildMember
    const currentPath = process.cwd();
    console.log(currentPath);

    const canvas = createCanvas(700, 250);
    const context = canvas.getContext('2d');

    const background = await loadImage('./src/images/canvas.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#0099ff';
    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.font = '28px Martel';
    context.fillStyle = '#ffffff';
    context.fillText('Happy Hunting', canvas.width / 2.5, canvas.height / 3.5);

    context.font = applyText(canvas, `WE ARE GODS!`, 300);
    context.fillStyle = '#ffffff';
    context.fillText(`WE ARE GODS!`, canvas.width / 2.5, canvas.height * 0.5);


    if (resultObject) {

        let workload = Workload.Low;
        if (resultObject.value > 10) {
            workload = Workload.Medium;
        }
        if (resultObject.value > 20) {
            workload = Workload.High;
        }
        const replaced = resultObject.label.replace('-', ' ');
        const text = `${workload} reservations at ${replaced}!`;

        context.font = applyText(canvas, text, canvas.width / 3);
        // context.fillStyle = '#ffffff';
        // context.fillText(text, canvas.width / 3, canvas.height * 0.8);

        const workloadText = `${workload} `;
        context.fillStyle = getWorkloadColor(workload);
        context.fillText(workloadText, canvas.width / 3, canvas.height * 0.8);


        context.font = applyText(canvas, text, canvas.width / 3);
        context.fillStyle = '#ffffff';
        context.fillText(text.substring(text.indexOf(' ') + 1), canvas.width / 3 + context.measureText(workloadText).width, canvas.height * 0.8);
    }


    context.beginPath();
    context.arc(125, 125, 100, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();


    const {body} = await request(interaction.client.user.displayAvatarURL({extension: 'jpg'}));
    const avatar = await loadImage('./src/images/mage.jpg');
    context.drawImage(avatar, 25, 25, 200, 200);
    const b = canvas.toBuffer('image/png')

    writeFileSync(join(__dirname, 'draw-emoji.png'), b)
    const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'botmessage.png'});

    const channelToSend = interaction.channel as TextChannel;
    await channelToSend.send({files: [attachment]});

}

