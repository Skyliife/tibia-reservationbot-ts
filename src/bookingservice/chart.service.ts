import {getAllCollectionsAndValues} from "./database.service";
import {Chart, Colors, registerables} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import * as fs from "fs";
import path, {join} from "path";
import {createCanvas, loadImage} from "@napi-rs/canvas"
import {writeFileSync} from "fs";


Chart.register(...registerables, ChartDataLabels, Colors);


export const createChart = async (databaseId: string) => {
    const data = await getAllCollectionsAndValues(databaseId);

    const counts: { [key: string]: number } = {};
    Object.keys(data).forEach((huntingPlace) => {
        if (data[huntingPlace].length === 0) return;
        counts[huntingPlace] = data[huntingPlace].length;
    });

    const totalReservations = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const percentages: { label: string; value: number }[] = Object.keys(counts).map((key, index) => {
        const percentage = (counts[key] / totalReservations) * 100;
        return {label: key, value: percentage};
    });

    const canvas = createCanvas(1000, 800);
    const ctx = canvas.getContext('2d');


    // const image = await loadImage('./src/images/Gods-Wallpaper-logo.png');
    //
    // const background = {
    //     id: 'customCanvasBackgroundImage',
    //     beforeDraw: (chart: Chart) => {
    //
    //         const ctx = chart.ctx;
    //         const {top, left, width, height} = chart.chartArea;
    //         const x = left + width / 2 - image.width / 2;
    //         const y = top + height / 2 - image.height / 2;
    //
    //         const aspectRatio = image.width / image.height;
    //         let newWidth, newHeight;
    //
    //         if (aspectRatio > 1) {
    //             // Landscape image
    //             newWidth = 180;
    //             newHeight = 180 / aspectRatio;
    //         } else {
    //             // Portrait or square image
    //             newWidth = 180 * aspectRatio;
    //             newHeight = 180;
    //         }
    //
    //         // @ts-ignore
    //         ctx.drawImage(image, x, y, newWidth, newHeight);
    //
    //     }
    // };

    const plugin = {
        id: 'customCanvasBackgroundColor',

        beforeDraw: (chart: Chart, args: any, options: any) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#424549';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };
    // @ts-ignore
    const myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: percentages.map((data) => data.label),
                datasets: [
                    {
                        data: percentages.map((data) => data.value),
                        datalabels: {
                            labels: {
                                index: {
                                    //@ts-ignore
                                    backgroundColor: (ctx) => ctx.dataset.backgroundColor,
                                    borderRadius: 4,
                                    color: '#000',
                                    font: {
                                        size: 22,
                                    },
                                    // @ts-ignore
                                    formatter: (val, ctx) => ctx.chart.data.labels[ctx.dataIndex],
                                    align: 'end',
                                    offset: 20,
                                    anchor: 'end',

                                },
                                name: {
                                    //@ts-ignore
                                    color: (ctx) => ctx.dataset.backgroundColor,
                                    font: {
                                        size: 20,
                                    },
                                    backgroundColor: '#424549',
                                    borderRadius: 4,
                                    offset: 0,
                                    padding: 2,
                                    formatter: (value) => {
                                        const floatValue = parseFloat(value);
                                        const integerValue = Math.floor(floatValue);
                                        return integerValue.toString(10) + '%';
                                    },
                                    align: 'top',
                                },
                            }
                        }
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 230,
                        right: 230,
                        top: 50,
                        bottom: 50,
                    },
                },
                plugins: {
                    //@ts-ignore
                    customCanvasBackgroundColor: {
                        color: '#424549',
                    },
                    legend: {
                        display: false,
                    },
                    datalabels: {
                        display: true,
                    },
                },
            },
           // plugins: [background],
        }
    );

    return canvas;

    // const relativeImgFolderPath = path.join(__dirname, '../img');
    //
    // if (!fs.existsSync(relativeImgFolderPath)) {
    //     fs.mkdirSync(relativeImgFolderPath);
    // }
    //
    // const filePath = path.join(relativeImgFolderPath, 'summary.png');
    // const buffer = canvas.toBuffer('image/png');
    // fs.writeFileSync(filePath, buffer);
    //
    // // const b = canvas.toBuffer('image/png')
    // //
    // // writeFileSync(join(__dirname, 'draw-emoji.png'), b)
}


