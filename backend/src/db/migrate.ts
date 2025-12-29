import { neon } from "@neondatabase/serverless";
import { config } from "../config/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("migration");

const migrations = [
    // Create conversations table
    `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
  )`,

    // Create messages table
    `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

    // Create index on messages conversation_id
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`,

    // Create index on messages created_at
    `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`,

    // Create index on conversations created_at
    `CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)`,

    // Create updated_at trigger function
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql'`,

    // Drop existing trigger if exists
    `DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations`,

    // Create trigger for conversations updated_at
    `CREATE TRIGGER update_conversations_updated_at
   BEFORE UPDATE ON conversations
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column()`,
];

async function runMigration(): Promise<void> {
    logger.info("Starting database migration");

    const sql = neon(config.DATABASE_URL);

    try {
        for (let i = 0; i < migrations.length; i++) {
            const migration = migrations[i];
            if (!migration) continue;

            logger.info(`Running migration ${i + 1}/${migrations.length}`);
            await sql(migration);
        }

        logger.info("Migration completed successfully");
    } catch (error) {
        logger.error("Migration failed", error);
        process.exit(1);
    }
}

runMigration();