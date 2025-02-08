type LogLevel = "info" | "warn" | "error";

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] ${message}`, meta ? meta : "");
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: any) {
    this.log("error", message, meta);
  }
}

export const logger = new Logger();
