import type { InferSelectModel } from 'drizzle-orm';
import type { Feed } from './feed';
import type { User } from './user';
import { feedFollows } from './db/schema/schema';
import {
  insertFeedFollow,
  selectFeedFollower,
} from './db/queries/queryFeedFollow';
import type { FeedFollowerJoin } from './db/queries/queryFeedFollow';

export type FeedFollow = InferSelectModel<typeof feedFollows>;

export async function createFeedFollow(
  feed: Feed,
  follower: User,
): Promise<FeedFollowerJoin | null> {
  try {
    const feedFollower: FeedFollow = await insertFeedFollow(
      follower.id,
      feed.id,
    );

    const feedFollowerJoin: FeedFollowerJoin = await selectFeedFollower(
      feedFollower.id,
    );

    return feedFollowerJoin;
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `There was an error with attempting to follow that feed: ${err.message}`,
      );
    }
    return null;
  }
}
