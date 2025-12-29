import { db } from "./index.js";
import { conversations, messages } from "./schema.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("seed");

async function seed(): Promise<void> {
    logger.info("Starting database seed");

    try {
        // Create a sample conversation
        const [conversation] = await db
            .insert(conversations)
            .values({
                metadata: { source: "seed" },
            })
            .returning();

        if (!conversation) {
            throw new Error("Failed to create seed conversation");
        }

        // Add sample messages
        await db.insert(messages).values([
            {
                conversationId: conversation.id,
                sender: "user",
                text: "What is your return policy?",
            },
            {
                conversationId: conversation.id,
                sender: "ai",
                text: "We offer a 30-day return window from the delivery date. Items must be unused and in their original packaging. For defective items, returns are free.  For non-defective returns, there is a $7.99 return shipping fee.  Please note that electronics must be returned within 15 days.  Refunds are processed within 5-7 business days after we receive the return.",
            },
        ]);

        logger.info("Seed completed successfully", { conversationId: conversation.id });
    } catch (error) {
        logger.error("Seed failed", error);
        process.exit(1);
    }
}

seed();