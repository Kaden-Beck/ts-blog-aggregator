import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { feeds, users } from './db/schema/schema';

// Infered Drizzle Types
export type SelectFeed = InferSelectModel<typeof feeds>;
export type InsertFeed = InferInsertModel<typeof feeds>;
export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

// Is records check
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
