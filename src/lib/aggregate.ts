import { getNextFeedToFetch, markFeedFetched } from './db/queries/queryFeeds';
import { getUserById } from './db/queries/queryUsers';
import type { Feed } from './feed';
import { fetchRSSFeed, parseXML } from './rss';
import type { RSSItem } from './rss';
import { handleError } from './utils';

export function parseTimeBetweenReqs(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error(
      `Invalid duration string: "${durationStr}". Expected format like 1s, 1m, 1h`,
    );
  }

  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown unit: ${match[2]}`);
  }
}

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h${m}m${s}s`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
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

export async function aggregate(durationStr: string): Promise<void> {
  const timeBetweenRequests = parseTimeBetweenReqs(durationStr);
  console.log(`Collecting feeds every ${formatDuration(timeBetweenRequests)}`);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log('\nStopping feed aggregation.');
      resolve();
    });
  });
}
