import { XMLParser } from 'fast-xml-parser';
import { isRecord } from './utils';

/* ***************
 TYPES
* ****************/

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

interface Channel {
  title: string;
  link: string;
  description: string;
  item?: any[];
}

/*****************
  TYPE HELPERS
* ****************/

// Check metadata of channel
function checkMetadata(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    typeof value.link === 'string' &&
    typeof value.description === 'string'
  );
}

// Check if a given item is a RSSItem Type
function isRSSItem(value: unknown): value is RSSItem {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    typeof value.link === 'string' &&
    typeof value.description === 'string' &&
    typeof value.pubDate === 'string'
  );
}

/*****************
  RSS Handling Functions
* ****************/

export async function fetchRSSFeed(feedURL: string): Promise<string> {
  const response = await fetch(feedURL, {
    method: 'GET',
    headers: {
      'User-Agent': 'gator',
    },
  });

  const data = await response.text();

  return data;
}

function getRSSItems(channel: Channel): RSSItem[] {
  if (!channel.item) {
    return [];
  }

  const unfilteredItems = Array.isArray(channel.item)
    ? channel.item
    : [channel.item];

  const filteredItems: RSSItem[] = [];

  for (const item of unfilteredItems) {
    if (isRSSItem(item)) {
      filteredItems.push(item);
    }
  }

  return filteredItems;
}

// Parse typescript objects from RSS Feed using fast-rss-parsr
export function parseXML(xmlString: string): RSSFeed {
  const parser = new XMLParser({ processEntities: false, htmlEntities: true });
  const parsedXML = parser.parse(xmlString);

  // Check if the parsed data has a rss.channel item
  if (!parsedXML.rss?.channel) {
    throw new Error('No channel information for this feed was found');
  }
  // Check that channel has title, link, and description
  if (!checkMetadata(parsedXML.rss.channel)) {
    throw new Error('Issue parsing channel metadata');
  }

  const metadata = parsedXML.rss.channel;

  return {
    channel: {
      title: metadata.title,
      link: metadata.link,
      description: metadata.description,
      item: getRSSItems(parsedXML.rss.channel),
    },
  } as RSSFeed;
}
