function stamp(level: string, message: string, meta?: unknown) {
  const time = new Date().toISOString();

  if (meta === undefined) {
    console[level === "error" ? "error" : "log"](`[${time}] ${level.toUpperCase()}: ${message}`);
    return;
  }

  console[level === "error" ? "error" : "log"](`[${time}] ${level.toUpperCase()}: ${message}`, meta);
}

export const logger = {
  info(message: string, meta?: unknown) {
    stamp("info", message, meta);
  },
  warn(message: string, meta?: unknown) {
    stamp("warn", message, meta);
  },
  error(message: string, meta?: unknown) {
    stamp("error", message, meta);
  },
};