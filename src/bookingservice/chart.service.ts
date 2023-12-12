import {getAllCollectionsAndValues} from "./database.service";
import {Chart, Colors, registerables} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {createCanvas, loadImage} from "canvas";
import * as fs from "fs";
import path from "path";


Chart.register(...registerables, ChartDataLabels, Colors);


export const createChart = async (databaseId:string) => {
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

    const canvas: any = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');


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
            //plugins: [background],
        }
    );

    const relativeImgFolderPath = path.join(__dirname, '../img');

    if (!fs.existsSync(relativeImgFolderPath)) {
        fs.mkdirSync(relativeImgFolderPath);
    }

    const filePath = path.join(relativeImgFolderPath, 'summary.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
}


