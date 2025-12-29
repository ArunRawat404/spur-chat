import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
        .references(() => conversations.id, { onDelete: "cascade" })
        .notNull(),
    sender: text("sender", { enum: ["user", "ai"] }).notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ConversationRow = typeof conversations.$inferSelect;
export type NewConversationRow = typeof conversations.$inferInsert;
export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;