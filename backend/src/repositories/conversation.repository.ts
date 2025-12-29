import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { conversations, messages } from "../db/schema.js";
import type { Message } from "../types/index.js";

export class ConversationRepository {
    async create(): Promise<{ id: string }> {
        const [conversation] = await db
            .insert(conversations)
            .values({})
            .returning({ id: conversations.id });

        if (!conversation) {
            throw new Error("Failed to create conversation");
        }

        return conversation;
    }

    async exists(id: string): Promise<boolean> {
        const [result] = await db
            .select({ id: conversations.id })
            .from(conversations)
            .where(eq(conversations.id, id))
            .limit(1);

        return result !== undefined;
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        const result = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(messages.createdAt);

        return result.map((row) => ({
            id: row.id,
            conversationId: row.conversationId,
            sender: row.sender as "user" | "ai",
            text: row.text,
            createdAt: row.createdAt,
        }));
    }

    async addMessage(
        conversationId: string,
        sender: "user" | "ai",
        text: string
    ): Promise<void> {
        await db.insert(messages).values({
            conversationId,
            sender,
            text,
        });
    }
}

export const conversationRepository = new ConversationRepository();