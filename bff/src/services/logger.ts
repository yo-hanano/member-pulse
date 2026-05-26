import pino from "pino";

type LogLevel = "debug" | "info" | "warn" | "error";
const allowedLevels: ReadonlySet<LogLevel> = new Set([
  "debug",
  "info",
  "warn",
  "error",
]);

const resolveLogLevel = (): LogLevel => {
  const raw = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  if (allowedLevels.has(raw as LogLevel)) {
    return raw as LogLevel;
  }
  return "info";
};

const formatJstTimestamp = () => {
  const jstMs = Date.now() + 9 * 60 * 60 * 1000;
  const jstDate = new Date(jstMs);
  return jstDate.toISOString().replace("Z", "");
};

const baseLogger = pino({
  level: resolveLogLevel(),
  // pid/hostnameを出さない
  base: null,
  timestamp: () => `,"time":"${formatJstTimestamp()}"`,
});

const logWith = (level: LogLevel, message: string, args: unknown[]) => {
  if (args.length === 0) {
    baseLogger[level](message);
    return;
  }
  const [first, ...rest] = args;
  if (first instanceof Error) {
    baseLogger[level]({ err: first, args: rest }, message);
    return;
  }
  baseLogger[level]({ args }, message);
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => logWith("debug", message, args),
  info: (message: string, ...args: unknown[]) => logWith("info", message, args),
  warn: (message: string, ...args: unknown[]) => logWith("warn", message, args),
  error: (message: string, ...args: unknown[]) => logWith("error", message, args),
};
