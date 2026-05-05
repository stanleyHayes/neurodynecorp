import pino from "pino";

export type Environment = "development" | "staging" | "production";

export function createLogger(environment: Environment = "development"): pino.Logger {
  if (environment === "development") {
    return pino({
      name: "neurodyne-server",
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    });
  }

  return pino({
    name: "neurodyne-server",
    level: "info",
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
