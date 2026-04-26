import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { feeds } from './db/schema/schema';
import { createFeed, getFeedsUsers } from './db/queries/feeds';
import { SelectUser } from './user';
import { createFeedFollow } from './feedFollower';
import { getCurrentUser } from './db/queries/users';

// Infered Drizzle Types
export type SelectFeed = InferSelectModel<typeof feeds>;
export type InsertFeed = InferInsertModel<typeof feeds>;

export function printFeed(feed: SelectFeed, user: SelectUser) {
  console.log(`${JSON.stringify(feed, null, 2)}`);
  console.log(`${JSON.stringify(user, null, 2)}`);
}

export async function addFeed(
  name: string,
  url: string,
  currrentUser: SelectUser,
) {
  const feed: SelectFeed = await createFeed(
    { name: name, url: url },
    currrentUser,
  );

  const user: SelectUser = await getCurrentUser();

  const result = await createFeedFollow(feed, user);
  if (result) {
    console.log(`${user} subscribed to ${result.feedName}`);
  }
  return feed;
}

export async function printFeeds(): Promise<void> {
  const feeds = await getFeedsUsers();

  for (const feed of feeds) {
    console.log(
      `Feed: ${feed.feeds.name}\n  Url: ${feed.feeds.url}\n  Created by: ${feed.users?.name}`,
    );
  }
}
