import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).default("4000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // LLM Configuration
    LLM_PROVIDER: z.enum(["openai", "anthropic", "gemini"]).default("gemini"),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),

    // Model names
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
    ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-latest"),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

    // CORS
    CORS_ORIGIN: z.string().default("*"),
});

const parseEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("Environment validation failed:");
        console.error(result.error.format());
        process.exit(1);
    }

    const cfg = result.data;

    const providerKeyMap: Record<string, string | undefined> = {
        openai: cfg.OPENAI_API_KEY,
        anthropic: cfg.ANTHROPIC_API_KEY,
        gemini: cfg.GEMINI_API_KEY,
    };

    if (!providerKeyMap[cfg.LLM_PROVIDER]) {
        console.error(`API key for ${cfg.LLM_PROVIDER} is not configured`);
        process.exit(1);
    }

    return cfg;
};

export const config = parseEnv();