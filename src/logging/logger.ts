import winston, { format } from "winston";
const align = format.align;

// Define custom log levels and colors
const customLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  custom: 4,
};

const customColors = {
  silly: "magenta",
  input: "grey",
  verbose: "cyan",
  prompt: "grey",
  info: "green",
  data: "grey",
  help: "cyan",
  warn: "yellow",
  debug: "blue",
  error: "red",
};

winston.addColors(customColors);

const customFormat = format.combine(
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  align(),
  format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
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
});

export default logger;
