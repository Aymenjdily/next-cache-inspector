type LogLevel = "debug" | "info" | "warn" | "error";

function write(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  process.stderr.write(`[${timestamp}] ${level.toUpperCase()} ${message}\n`);
}

/**
 * Writes a debug message to stderr when debug logging is enabled.
 */
export function debug(message: string): void {
  if (process.env.DEBUG?.includes("next-cache-inspector")) {
    write("debug", message);
  }
}

/**
 * Writes an informational message to stderr.
 */
export function info(message: string): void {
  write("info", message);
}

/**
 * Writes a warning message to stderr.
 */
export function warn(message: string): void {
  write("warn", message);
}

/**
 * Writes an error message to stderr.
 */
export function error(message: string): void {
  write("error", message);
}
