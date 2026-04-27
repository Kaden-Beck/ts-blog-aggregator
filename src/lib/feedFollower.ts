import type { InferSelectModel } from 'drizzle-orm';
import type { Feed } from './feed';
import type { User } from './user';
import { feedFollows } from './db/schema/schema';
import {
  insertFeedFollow,
  selectFeedFollower,
  selectFeedFollowByUserAndFeed,
} from './db/queries/queryFeedFollow';
import type { FeedFollowerJoin } from './db/queries/queryFeedFollow';

export type FeedFollow = InferSelectModel<typeof feedFollows>;

export async function createFeedFollow(
  feed: Feed,
  follower: User,
): Promise<FeedFollowerJoin | null> {
  const existing = await selectFeedFollowByUserAndFeed(follower.id, feed.id);
  if (existing) {
    console.log(`You are already following ${feed.name}.`);
    return null;
  }

  const feedFollower: FeedFollow = await insertFeedFollow(follower.id, feed.id);
  const feedFollowerJoin: FeedFollowerJoin = await selectFeedFollower(feedFollower.id);
  return feedFollowerJoin;
}
