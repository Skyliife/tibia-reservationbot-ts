import winston, { format } from "winston";
const align = format.align;

// Define custom log levels and colors
winston.addColors({
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
});

// Create a custom log format
const costumFormat = format.combine(
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  align(),
  format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? `${JSON.stringify(meta, null, 0)}` : "";
    return `[ \x1b[ ${winston.format
      .colorize()
      .colorize(level, level.toUpperCase())} \x1b[0m] ${timestamp} ${message} ${metaString}`;
  })
);

// Define the Winston logger with transports and the custom format
const logger = winston.createLogger({
  level: "info",
  format: costumFormat,
  transports: [new winston.transports.Console()],
});

export default logger;
