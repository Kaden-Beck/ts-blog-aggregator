import { getNextFeedToFetch, markFeedFetched } from './db/queries/queryFeeds';
import { createPost } from './db/queries/queryPosts';
import { getUserById } from './db/queries/queryUsers';
import type { Feed } from './feed';
import { fetchRSSFeed, parseXML } from './rss';
import type { RSSFeed, RSSItem } from './rss';
import { InsertPost } from './db/queries/queryPosts';
import { handleError } from './utils';

// Automating scraper and aggregator

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h${m}m${s}s`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

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

// Aggregate Function: Accepts a duration string argument, parses it
export async function aggregate(durationStr: string): Promise<void> {
  // Parse duration string
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

// Scraping Logic
async function getNextFeed(): Promise<Feed> {
  const nextFeed: Feed = await getNextFeedToFetch();
  if (!nextFeed) {
    throw new Error(`Wasn't able to retrieve next feed to fetch`);
  }
  return nextFeed;
}

async function upsertPosts(rssItems: RSSItem[], feedData: Feed) {
  // Iterate over the items in the feed and insert them into the database.
  for (const item of rssItems) {
    const postData: InsertPost = {
      url: item.link,
      feedId: feedData.id,
      title: item.title,
      description: item.description,
      publishedAt: new Date(item.pubDate),
    };
    const result = await createPost(postData);
  }
}

export async function scrapeFeeds() {
  // Get the next feed to fetch from the DB
  const _feed = await getNextFeed();

  // Fetch the feed using the URL (we already wrote this function)
  const rssString = await fetchRSSFeed(_feed.url);
  if (!rssString) {
    throw new Error(
      `Unable to fetch the next RSS Feed (${_feed.name}) from the URL provided )${_feed.url}`,
    );
  }

  // Mark Feed as fetched
  await markFeedFetched(_feed).catch(handleError);

  // Attempt to insert feed if non existing (upsert)
  await upsertPosts(parseXML(rssString).channel.item, _feed).catch(handleError);
}
