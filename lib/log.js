const { createLogger, format, transports } = require("winston");
const util = require("util");

module.exports = (file) => {
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.label({
        label: file.split(/(\\|\/)/g).pop(),
      }),
      format.colorize(),
      format.printf((info) => {
        return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
      })
    ),
    transports: [new transports.Console()],
  });

  const processArgs = (args) => {
    const mappedArgs = args.map((e) => {
      if (e instanceof Error) return e.toString();
      return e;
    });
    return util.format("%j", mappedArgs);
  };

  const obj = {
    info: (...args) => {
      logger.info(processArgs(args));
    },
    warn: (...args) => {
      logger.warn(processArgs(args));
    },
    error: (...args) => {
      logger.error(processArgs(args));
    },
  };

  return obj;
};
