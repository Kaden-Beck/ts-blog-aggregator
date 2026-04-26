import { db } from '..';
import { FeedFollow } from '../../feedFollower';
import { User } from '../../user';
import { feedFollows, feeds, users } from '../schema/schema';
import { eq } from 'drizzle-orm';

export interface FeedFollowerJoin {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  feedName: string;
  feedUrl: string;
  username: string;
}

export async function insertFeedFollow(
  userId: string,
  feedId: string,
): Promise<FeedFollow> {
  const [result] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  return result;
}

export async function selectFeedFollower(
  id: string,
): Promise<FeedFollowerJoin> {
  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedName: feeds.name,
      feedUrl: feeds.url,
      username: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, id));

  return result;
}

export async function selectFollowsByUser(user: User) {
  const feedData: Array<{ id: string; name: string; url: string }> = await db
    .select({ id: feeds.id, name: feeds.name, url: feeds.url })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, user.id));

  return { username: user.name, feedData };
}
