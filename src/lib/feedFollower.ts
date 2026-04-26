import type { InferSelectModel } from 'drizzle-orm';
import { SelectFeed } from './feeds';
import { SelectUser } from './user';
import { feedFollows } from './db/schema/schema';
import {
  FeedFollowerJoin,
  insertFeedFollow,
  selectFeedFollower,
} from './db/queries/feedFollow';

export type SelectFeedFollow = InferSelectModel<typeof feedFollows>;

export async function createFeedFollow(feed: SelectFeed, follower: SelectUser) {
  try {
    const feedFollower: SelectFeedFollow = await insertFeedFollow(
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
      throw new Error(err.name);
    }
  }
}
