class Logger {
    private readonly context: string;

    constructor(context: string = "app") {
        this.context = context;
    }

    private log(level: string, message: string, data?: Record<string, unknown>): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${this.context}]`;

        if (data) {
            console.log(prefix, message, JSON.stringify(data));
        } else {
            console.log(prefix, message);
        }
    }

    debug(message: string, data?: Record<string, unknown>): void {
        if (process.env.NODE_ENV === "development") {
            this.log("DEBUG", message, data);
        }
    }

    info(message: string, data?: Record<string, unknown>): void {
        this.log("INFO", message, data);
    }

    warn(message: string, data?: Record<string, unknown>): void {
        this.log("WARN", message, data);
    }

    error(message: string, error?: unknown): void {
        if (error instanceof Error) {
            this.log("ERROR", message, { error: error.message, stack: error.stack });
        } else {
            this.log("ERROR", message);
        }
    }
}

export const createLogger = (context: string): Logger => new Logger(context);