import { getNextFeedToFetch, markFeedFetched } from './db/queries/queryFeeds';
import { getUserById } from './db/queries/queryUsers';
import type { Feed } from './feed';
import { fetchRSSFeed, parseXML } from './rss';
import type { RSSItem } from './rss';

export function parseTimeBetweenReqs(durationStr: string) {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (match) {
    console.log(`Collecting feeds every ${match[0]}${match[1]}`);
  }
}

export async function scrapeFeeds() {
  // Get the next feed to fetch from the DB,
  const nextFeed: Feed = await getNextFeedToFetch();
  if (!nextFeed) {
    console.error(`Wasn't able to retrieve next feed to fetch`);
    return;
  }

  // Fetch the feed using the URL (we already wrote this function)
  const fetchResult = await fetchRSSFeed(nextFeed.url);
  if (!fetchResult) {
    console.error(
      `Unable to fetch the next RSS Feed (${nextFeed.name}) from the URL provided )${nextFeed.url}`,
    );
    return;
  }
  const feedUser = await getUserById(nextFeed.userId);

  const items: RSSItem[] = parseXML(fetchResult).channel.item;
  // Mark Feed as fetched
  const update = await markFeedFetched(nextFeed);
  if (!update) {
    console.log(
      `Unable to update fetch data for ${nextFeed.name}. Continuing.`,
    );
  }

  // Iterate over the items in the feed and print their titles to the console.
  for (const item of items) {
    console.log(item.title);
  }
}
