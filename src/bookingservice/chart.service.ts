import {Chart, Colors, registerables} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {createCanvas} from "@napi-rs/canvas"
import utils from "../chartutlis/utils";
import {resolve} from 'chart.js/helpers';
import {DatabaseResult} from "../types";

Chart.register(...registerables, ChartDataLabels, Colors);


export const createChartForSummary = async (data: DatabaseResult) => {

    const counts: { [key: string]: number } = {};
    Object.keys(data).forEach((huntingPlace) => {
        if (data[huntingPlace].length === 0) return;
        counts[huntingPlace] = data[huntingPlace].length;
    });

   // console.log("Counts:", counts);

    const values = Object.keys(counts).map((key, index) => {
        const amount = counts[key];
        return {label: key, value: amount};
    });

    const totalReservations = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const percentages: { label: string; value: number }[] = Object.keys(counts).map((key, index) => {
        const percentage = (counts[key] / totalReservations) * 100;
        return {label: key, name: percentage, value: counts[key]};
    });
    // console.log("values", values);
    // console.log("totalReservations", totalReservations);
    // console.log("percentages", percentages);

    const canvas = createCanvas(1500, 800);
    const ctx = canvas.getContext('2d');


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
    // @ts-ignore
    const myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {

                labels: percentages.map((data) => data.label),
                datasets: [
                    {
                        data: values.map((data) => data.value),
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
                                        const percentage = (value / totalReservations) * 100;
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

        // Calculate the adjustment ratio to fit the text area into the doughnut inner circle
        let hypotenuse = Math.sqrt(Math.pow(textAreaSize.width, 2) + Math.pow(textAreaSize.height, 2));
        let innerDiameter = chart.innerRadius * 2;
        let fitRatio = innerDiameter / hypotenuse;

        // Adjust the font if necessary and recalculate the text area after applying the fit ratio
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

        // The center of the inner circle
        let centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        let centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

        // The top Y coordinate of the text area
        let topY = centerY - textAreaSize.height / 2;

        let i;
        let ilen = innerLabels.length;
        let currentHeight = 0;
        for (i = 0; i < ilen; ++i) {
            ctx.fillStyle = innerLabels[i].color;
            ctx.font = innerLabels[i].font.string;

            // The Y center of each line
            let lineCenterY = topY + innerLabels[i].font.lineHeight / 2 + currentHeight;
            currentHeight += innerLabels[i].font.lineHeight;

            // Draw each line of text
            ctx.fillText(innerLabels[i].text, centerX, lineCenterY);
        }
    }
}

export const createChartForStatistics = async (data: any) => {

}





