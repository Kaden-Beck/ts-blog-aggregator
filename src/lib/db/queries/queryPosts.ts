import { db } from '..';
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { feedFollows, feeds, posts } from '../schema/schema';
import { User } from '../../user';

// Infered Drizzle Types
export type Post = InferSelectModel<typeof posts>;
export type InsertPost = InferInsertModel<typeof posts>;

export async function createPost(postData: InsertPost) {
  const { title, url, description, publishedAt, feedId } = postData;

  const [result]: Post[] = await db
    .insert(posts)
    .values({
      title: title,
      url: url,
      description: description ?? undefined,
      publishedAt: publishedAt ?? undefined,
      feedId: feedId,
    })
    .returning();

  return result;
}

export async function getPostsForUser(user: User, limit?: number) {
  const result = await db
    .select()
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, user.id))
    .orderBy(posts.publishedAt)
    .limit(limit ?? 20);
  return result;
}
