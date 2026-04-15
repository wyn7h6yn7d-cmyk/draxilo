type Level = "debug" | "info" | "warn" | "error";

function redact(value: unknown) {
  if (!value) return value;
  if (typeof value !== "object") return value;
  const json = JSON.stringify(value, (_k, v) => {
    if (typeof v === "string") {
      if (v.includes("sk-") || v.toLowerCase().includes("api_key") || v.toLowerCase().includes("service_role")) {
        return "[redacted]";
      }
    }
    return v;
  });
  return JSON.parse(json);
}

function write(level: Level, msg: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...(meta ? { meta: redact(meta) } : {}),
  };
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](entry);
}

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => write("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => write("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write("error", msg, meta),
};

