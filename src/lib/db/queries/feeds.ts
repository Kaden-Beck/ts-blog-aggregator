import { db } from '..';
import { feeds, users } from '../schema/schema';
import { RSSFeed } from '../../../rss';
import { SelectFeed } from '../../../feeds';
import { SelectUser } from '../../../user';
import { eq } from 'drizzle-orm';

export async function createFeed(
  feedData: RSSFeed | { name: string; url: string },
  user: SelectUser,
): Promise<SelectFeed> {
  const name = 'channel' in feedData ? feedData.channel.title : feedData.name;
  const url = 'channel' in feedData ? feedData.channel.link : feedData.url;

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

export async function getFeeds_Users() {
  const result = await db
    .select()
    .from(feeds)
    .leftJoin(users, eq(feeds.userId, users.id));
  return result;
}
