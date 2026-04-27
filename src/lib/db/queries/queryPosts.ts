import { db } from '..';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { posts } from '../schema/schema';

// Infered Drizzle Types
export type Post = InferSelectModel<typeof posts>;
export type InsertPost = InferInsertModel<typeof posts>;

export async function createPost(postData: InsertPost) {
  const { title, url, description, publishedAt, feedId } = postData;

  const result = await db
    .insert(posts)
    .values({
      title: title,
      url: url,
      description: description ?? undefined,
      publishedAt: publishedAt ?? undefined,
      feedId: feedId,
    })
    .returning();
  if (result) {
    return result;
  }
  return;
}

