import type { InferSelectModel } from 'drizzle-orm';
import { feeds } from './db/schema/schema';
import { createFeed, getFeedByURL, getFeedsUsers } from './db/queries/queryFeeds';
import type { User } from './user';
import { createFeedFollow } from './feedFollower';
import { getCurrentUser } from './db/queries/queryUsers';

// Infered Drizzle Types
export type Feed = InferSelectModel<typeof feeds>;

export function printFeed(feed: Feed, user: User): void {
  console.log(`${JSON.stringify(feed, null, 2)}`);
  console.log(`${JSON.stringify(user, null, 2)}`);
}

export async function addFeed(
  name: string,
  url: string,
  currrentUser: User,
): Promise<Feed | null> {
  const existing = await getFeedByURL(url);
  if (existing) {
    console.log(`A feed with that URL already exists: ${existing.name}`);
    return existing;
  }

  const feed: Feed = await createFeed({ name: name, url: url }, currrentUser);
  const user: User = await getCurrentUser();
  const result = await createFeedFollow(feed, user);
  if (result) {
    console.log(`${user.name} subscribed to ${result.feedName}`);
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
