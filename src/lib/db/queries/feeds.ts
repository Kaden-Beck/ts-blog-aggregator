import { db } from '..';
import { feeds } from '../schema/schema';
import { SelectUser } from '../../utils';
import { RSSFeed } from '../../../rss';

type FeedInput = RSSFeed | { name: string; url: string };

function isRSSFeed(feedData: FeedInput): feedData is RSSFeed {
  return 'channel' in feedData;
}

export async function createFeed(
  feedData: FeedInput,
  user: SelectUser,
) {
  const name = isRSSFeed(feedData) ? feedData.channel.title : feedData.name;
  const url = isRSSFeed(feedData) ? feedData.channel.link : feedData.url;

  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId: user.id,
    })
    .returning();

  return result;
}
