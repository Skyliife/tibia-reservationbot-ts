import {Chart, Colors, registerables} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {createCanvas} from "@napi-rs/canvas"
import utils from "../chartutlis/utils";
import {resolve} from 'chart.js/helpers';
import {DatabaseResult, DatabaseResultForSummary} from "../types";

Chart.register(...registerables, ChartDataLabels, Colors);

const doughnutLabel = {
    id: 'doughnutlabel',
    beforeDatasetDraw: function (chart: any, args: any, options: typeof resolve) {
        drawDoughnutLabel(chart, options);
    }
};

const plugin = {
    id: 'customCanvasBackgroundColor',

    beforeDraw: (chart: Chart, args: any, options: any) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#001CC3';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};
export const createChartForSummary = async (data: DatabaseResult, data2: DatabaseResultForSummary) => {

    const counts: { [key: string]: number } = {};
    Object.keys(data).forEach((huntingPlace) => {
        if (data[huntingPlace].length === 0) return;
        counts[huntingPlace] = data[huntingPlace].length;
    });

    //console.log("Counts:", counts);

    const values = Object.keys(counts).map((key, index) => {
        const amount = counts[key];
        return {label: key, value: amount};
    });
    //console.log("values", values);

    const totalReservations = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const percentages: { label: string; value: number }[] = Object.keys(counts).map((key, index) => {
        const percentage = (counts[key] / totalReservations) * 100;
        return {label: key, name: percentage, value: counts[key]};
    });
    // console.log("values", values);
    // console.log("totalReservations", totalReservations);
    // console.log("percentages", percentages);
    const counts2: { [key: string]: number } = {};
    Object.keys(data2).forEach((huntingPlace) => {
        Object.keys(data2[huntingPlace]).forEach((huntingSpot) => {
            if (data2[huntingPlace][huntingSpot].length === 0) return;
            counts2[huntingSpot] = data2[huntingPlace][huntingSpot].length;
        });
    });
    const values2 = Object.keys(counts2).map((key, index) => {
        const amount = counts2[key];
        return {label: key, value: amount};
    });
    //console.log("Counts2:", counts2);

    const canvas = createCanvas(1500, 1000);
    const ctx = canvas.getContext('2d');


    // @ts-ignore
    const myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {


                datasets: [
                    {
                        data: values.map((data) => data.value),
                        label: percentages.map((data) => data.label),
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
                                    formatter: (val, ctx) => ctx.chart.data.datasets[0].label[ctx.dataIndex],
                                    align: 'end',
                                    offset: 20,
                                    anchor: 'end',

                                },
                                name: {
                                    //@ts-ignore
                                    color: (ctx) => ctx.dataset.backgroundColor,
                                    font: {
                                        size: 17,
                                    },
                                    backgroundColor: '#424549',
                                    borderRadius: 4,
                                    offset: 0,
                                    padding: 2,
                                    formatter: (value) => {
                                        const percentage = (value / totalReservations) * 100;
                                        const integerValue = Math.floor(percentage);
                                        return integerValue.toString(10) + '%';
                                    },
                                    anchor: 'end',
                                    align: 'top',
                                },
                                value: {
                                    color: '#404040',
                                    font: {
                                        size: 15,
                                    },
                                    backgroundColor: '#fff',
                                    borderColor: '#fff',
                                    borderWidth: 2,
                                    borderRadius: 4,
                                    padding: 0,
                                    formatter: (value) => {
                                        return value;
                                    },
                                    anchor: 'end',
                                    align: 'bottom',
                                },
                            }
                        }
                    },
                    {
                        data: values2.map((data) => data.value),
                        label: values2.map((data) => data.label),
                        datalabels: {
                            labels: {
                                name: {
                                    //@ts-ignore
                                    color: (ctx) => ctx.dataset.backgroundColor,
                                    font: {
                                        size: 15,
                                    },
                                    backgroundColor: '#424549',
                                    borderRadius: 4,
                                    offset: 0,
                                    padding: 2,
                                    // @ts-ignore
                                    formatter: (value, ctx) => ctx.chart.data.datasets[1].label[ctx.dataIndex],
                                    anchor: (ctx) => {
                                        //console.log(ctx.dataIndex);
                                        const positions = ['start', 'center', 'end'];
                                        const index = ctx.dataIndex % positions.length;
                                        return positions[index];
                                    },
                                    align: (ctx) => {
                                        const positions = ['top', 'bottom'];
                                        const index = ctx.dataIndex % positions.length;
                                        return positions[index];
                                    },

                                },
                                value: {
                                    color: (ctx) => ctx.dataset.backgroundColor,
                                    backgroundColor: '#fff',
                                    font: {
                                        size: 15,
                                        bold: true,
                                    },
                                    borderColor: '#fff',
                                    borderWidth: 2,
                                    borderRadius: 4,
                                    padding: 0,
                                    formatter: (value) => {
                                        return value;
                                    },
                                    anchor: (ctx) => {
                                        const positions = ['start', 'center', 'end'];
                                        const index = ctx.dataIndex % positions.length;
                                        return positions[index];
                                    },
                                    align: (ctx) => {
                                        const positions = ['bottom', 'top'];
                                        const index = ctx.dataIndex % positions.length;
                                        return positions[index];
                                    },
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
                        left: 200,
                        right: 200,
                        top: 0,
                        bottom: 60,
                    },
                },
                plugins: {
                    //@ts-ignore
                    customCanvasBackgroundColor: {
                        color: '#100d2b',
                    },
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: 'Current reservations',
                        font: {weight: 'bold', size: 30},
                        color: '#fff',

                        padding: {
                            top: 10,
                            bottom: 60
                        },
                        position: 'top',
                    },
                    datalabels: {
                        display: true,
                    },
                    doughnutlabel: {
                        labels: [
                            {
                                text: `${totalReservations}`,
                                color: '#fff',
                                font: {
                                    size: 50,
                                    weight: 'bold',
                                },
                            },
                            {
                                text: 'total',
                                color: '#cccccc',
                                font: {
                                    size: 20,
                                },
                            },
                        ],
                    },
                },
            },
            plugins: [plugin, doughnutLabel],
        }
    );


    return canvas;
}

function drawDoughnutLabel(chart: any, options: any) {
    if (options && options.labels && options.labels.length > 0) {
        let ctx = chart.ctx;

        let innerLabels: any = [];
        options.labels.forEach(function (label: any) {
            let text = typeof (label.text) === 'function' ? label.text(chart) : label.text;
            let innerLabel = {
                text: text,
                font: utils.parseFont(resolve([label.font, options.font, {}], ctx, 0)),
                color: resolve([label.color, options.color, Chart.defaults.color], ctx, 0)
            };
            innerLabels.push(innerLabel);
        });

        let textAreaSize = utils.textSize(ctx, innerLabels);

        let hypotenuse = Math.sqrt(Math.pow(textAreaSize.width, 2) + Math.pow(textAreaSize.height, 2));
        let innerDiameter = chart.innerRadius * 2;
        let fitRatio = innerDiameter / hypotenuse;

        if (fitRatio < 1) {
            innerLabels.forEach(function (innerLabel: any) {
                innerLabel.font.size = Math.floor(innerLabel.font.size * fitRatio);
                innerLabel.font.lineHeight = undefined;
                innerLabel.font = utils.parseFont(resolve([innerLabel.font, {}], ctx, 0));
            });

            textAreaSize = utils.textSize(ctx, innerLabels);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        let centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

        let topY = centerY - textAreaSize.height / 2;

        let i;
        let ilen = innerLabels.length;
        let currentHeight = 0;
        for (i = 0; i < ilen; ++i) {
            ctx.fillStyle = innerLabels[i].color;
            ctx.font = innerLabels[i].font.string;

            let lineCenterY = topY + innerLabels[i].font.lineHeight / 2 + currentHeight;
            currentHeight += innerLabels[i].font.lineHeight;

            // Draw each line of text
            ctx.fillText(innerLabels[i].text, centerX, lineCenterY);
        }
    }
}

export const createChartForStatistics = async (data: {
    spot: string;
    amount: number
}[], username: string | undefined) => {


    const total = data.reduce((total, obj) => total + obj.amount, 0);

    const canvas = createCanvas(1500, 800);
    const ctx = canvas.getContext('2d');
    //@ts-ignore
    const myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {

                labels: data.map((data) => data.spot),
                datasets: [
                    {
                        data: data.map((data) => data.amount),

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
                                        const percentage = (value / total) * 100;
                                        const integerValue = Math.floor(percentage);
                                        return integerValue.toString(10) + '%';
                                    },
                                    align: 'top',
                                },
                                value: {
                                    color: '#404040',
                                    backgroundColor: '#fff',
                                    borderColor: '#fff',
                                    borderWidth: 2,
                                    borderRadius: 4,
                                    padding: 0,
                                    formatter: (value) => {
                                        return value;
                                    },
                                    align: 'bottom',
                                },
                            }
                        }
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 200,
                        right: 200,
                        top: 0,
                        bottom: 60,
                    },
                },
                plugins: {
                    //@ts-ignore
                    customCanvasBackgroundColor: {
                        color: '#100d2b',
                    },
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: `ALL TIME RESERVATIONS OF ${username}`,
                        font: {weight: 'bold', size: 30},
                        color: '#fff',

                        padding: {
                            top: 10,
                            bottom: 60
                        },
                        position: 'top',
                    },
                    datalabels: {
                        display: true,
                    },
                    doughnutlabel: {
                        labels: [
                            {
                                text: `${total}`,
                                color: '#fff',
                                font: {
                                    size: 50,
                                    weight: 'bold',
                                },
                            },
                            {
                                text: 'total',
                                color: '#cccccc',
                                font: {
                                    size: 20,
                                },
                            },
                        ],
                    },
                },
            },
            plugins: [plugin, doughnutLabel],
        }
    );
    return canvas;
};








