import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { feeds } from './lib/db/schema/schema';
import { SelectUser } from './user';
import { createFeed, getFeeds_Users } from './lib/db/queries/feeds';

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
  return await createFeed({ name: name, url: url }, currrentUser);
}

export async function printFeeds(): Promise<void> {
  const feeds = await getFeeds_Users();

  for (const feed of feeds) {
    console.log(
      `Feed: ${feed.feeds.name}\n  Url: ${feed.feeds.url}\n  Created by: ${feed.users?.name}`,
    );
  }
}
