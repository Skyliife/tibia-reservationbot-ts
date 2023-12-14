import winston, {format} from "winston";

const align = format.align;

// Define custom log levels and colors
const customLevels = {
    custom: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
};

const customColors = {
    silly: "magenta",
    input: "grey",
    verbose: "cyan",
    prompt: "grey",
    info: "green",
    data: "grey",
    help: "blue",
    warn: "yellow",
    debug: "cyan",
    error: "red",
};

winston.addColors(customColors);

const customFormat = format.combine(
    format.timestamp({
        format: "DD-MM-YYYY HH:mm:ss",
    }),
    align(),
    format.printf((info) => {
        const {timestamp, level, message, ...meta} = info;
        const metaString = Object.keys(meta).length ? `${JSON.stringify(meta, null, 0)}` : "";
        return `[${winston.format
            .colorize()
            .colorize(level, level.toUpperCase())}] ${timestamp} ${message} ${metaString}`;
    })
);

const logger = winston.createLogger({
    levels: customLevels,
    format: customFormat,
    transports: [new winston.transports.Console()],
    level: 'error',

});

export default logger;
