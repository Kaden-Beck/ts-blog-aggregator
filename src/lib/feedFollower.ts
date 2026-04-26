import type { InferSelectModel } from 'drizzle-orm';
import { Feed } from './feed';
import { User } from './user';
import { feedFollows } from './db/schema/schema';
import {
  FeedFollowerJoin,
  insertFeedFollow,
  selectFeedFollower,
} from './db/queries/feedFollow';

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
