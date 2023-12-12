import {AttachmentBuilder, ChatInputCommandInteraction, GuildMember, TextChannel} from "discord.js";
import {Canvas, createCanvas, loadImage} from "@napi-rs/canvas"
import {request} from "undici";

const {writeFileSync} = require('fs')
const {join} = require('path')


const applyText = (canvas: Canvas, text: string) => {
    const context = canvas.getContext('2d');
    let fontSize = 70;

    do {
        context.font = `${fontSize -= 10}px Martel`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
};

export const ImageService = async (interaction: ChatInputCommandInteraction) => {
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

    context.font = applyText(canvas, `${interaction.client.user.displayName}!`);
    context.fillStyle = '#ffffff';
    context.fillText(`WE ARE GODS!`, canvas.width / 2.5, canvas.height / 1.8);

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