import { db } from '..';
import { feeds, users } from '../schema/schema';
import type { RSSFeed } from '../../rss';
import type { Feed } from '../../feed';
import type { User } from '../../user';
import { eq, sql } from 'drizzle-orm';

export async function createFeed(
  feedData: RSSFeed | { name: string; url: string },
  user: User,
): Promise<Feed> {
  const name = 'channel' in feedData ? feedData.channel.title : feedData.name;
  const url = 'channel' in feedData ? feedData.channel.link : feedData.url;

  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId: user.id,
    })
    .returning();

  return result;
}

export async function getFeedByURL(url: string) {
  try {
    const [result] = await db
      .select()
      .from(feeds)
      .where(eq(feeds.url, url.trim()));

    return result;
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `There was an error while retrieving that feed with the URL provided: ${err.name}`,
      );
      throw new Error(err.message);
    }
  }
}

export async function getFeedsUsers() {
  const result = await db
    .select()
    .from(feeds)
    .leftJoin(users, eq(feeds.userId, users.id));
  return result;
}

export async function markFeedFetched(feed: Feed) {
  const now = new Date();

  const result = await db
    .update(feeds)
    .set({ lastFetched: now, updatedAt: now })
    .where(eq(feeds.id, feed.id))
    .returning();

  return result;
}

export async function getNextFeedToFetch(): Promise<Feed> {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetched} NULLS FIRST`)
    .limit(1);

  return result;
}
