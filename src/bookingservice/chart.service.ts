import {getAllCollectionsAndValues} from "./database.service";
import {Chart, Colors, registerables} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {createCanvas} from "canvas";
import * as fs from "fs";
import path from "path";

Chart.register(...registerables, ChartDataLabels, Colors);


export const createChart = async () => {
    const data = await getAllCollectionsAndValues();

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
        //@ts-ignore
        beforeDraw: (chart, args, options) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#99ffff';
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
                                backgroundColor: '#424549',
                                color: '#fff',
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
                                backgroundColor: '#404040',
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
        //plugins: [plugin],
    }

    );

    const relativeImgFolderPath = path.join(__dirname, '../img');
    console.log("__dirname",__dirname);
    console.log("relativeImgFolderPath",relativeImgFolderPath);

    if (!fs.existsSync(relativeImgFolderPath)) {
        fs.mkdirSync(relativeImgFolderPath);
    }

    const filePath = path.join(relativeImgFolderPath, 'currentCapacities.png');
    console.log("filePath",filePath)
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
}


