import Chart from 'chart.js';
import {isNullOrUndef, toLineHeight, valueOrDefault} from 'chart.js/helpers';


const utils = {

    parseFont: function (value: any) {
        let global: Chart.Defaults = Chart.defaults;
        let size = valueOrDefault(value.size, global.font.size);
        let font = {
            family: valueOrDefault(value.family, global.font.family),
            lineHeight: toLineHeight(value.lineHeight, size),
            size: size,
            style: valueOrDefault(value.style, global.font.style),
            weight: valueOrDefault(value.weight, null),
            string: ''
        };

        font.string = utils.toFontString(font);
        return font;
    },

    toFontString: function (font: any) {
        if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
            return "";
        }

        return (font.style ? font.style + ' ' : '')
            + (font.weight ? font.weight + ' ' : '')
            + font.size + 'px '
            + font.family;
    },

    textSize: function (ctx: any, labels: any) {
        let items: any = [].concat(labels);
        let ilen = items.length;
        let prev = ctx.font;
        let width = 0;
        let height = 0;
        let i;

        for (i = 0; i < ilen; ++i) {
            ctx.font = items[i].font.string;
            width = Math.max(ctx.measureText(items[i].text).width, width);
            height += items[i].font.lineHeight;
        }

        ctx.font = prev;

        return {
            height: height,
            width: width
        };
    }

};

export default utils;