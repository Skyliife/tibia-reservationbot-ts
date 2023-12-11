import {AttachmentBuilder, ChatInputCommandInteraction} from "discord.js";
import {createCanvas, loadImage} from "@napi-rs/canvas"
import * as fs from 'fs';



export const ImageService = async (interaction: ChatInputCommandInteraction) => {
    const currentPath = process.cwd();
    console.log(currentPath);
    const canvas = createCanvas(700, 250);
    const context = canvas.getContext('2d');
    const background = await loadImage('./build/img/canvas.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'profile-image.png'});

    await interaction.editReply({files: [attachment]});
}