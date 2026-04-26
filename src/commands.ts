import { readConfig, setUser } from './config';
import { getCurrentUser, getUsers } from './lib/db/queries/users';
import { fetchRSSFeed, parseXML, RSSFeed } from './lib/rss';
import { addFeed, printFeed, printFeeds, SelectFeed } from './lib/feeds';
import { clearUsers, loginUser, registerUser, SelectUser } from './lib/user';
import { createFeedFollow } from './lib/feedFollower';
import { createFeed, getFeedByURL } from './lib/db/queries/feeds';
import { selectFollowsByUser } from './lib/db/queries/feedFollow';

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

// > start login {username} -> sets the user in config file to {username}
export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  // Handle Argument Count
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a username argument`);
  }

  const result = await loginUser(args[0].trim());
  // Log Result
  console.log(`User set to ${result.name}`);
}

// > register {name} -> createUser(name) => result
export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a name argument`);
  }
  const username = args[0].trim();
  const result = await registerUser(username);

  setUser(username);

  console.log(
    `User "${username}" was added.\n${JSON.stringify(result, null, 2)}`,
  );
}

// > reset -> resets user table rows
export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await clearUsers();
}
// > users -> prints a list of users
export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const results = await getUsers();
  const currentUser = readConfig().currentUserName;

  for (const result of results) {
    let _name = result.name;

    if (_name == currentUser) {
      console.log(`* ${_name} (current)`);
    } else {
      console.log(`* ${_name}`);
    }
  }
}
// > agg {url} -> Aggregates a blog and prints to console
export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const rawXML = await fetchRSSFeed('https://www.wagslane.dev/index.xml');
  const parsedXML: RSSFeed = parseXML(rawXML);

  console.log(JSON.stringify(parsedXML, null, 2));
}
// Adds a feed to db with current user
export async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 2) {
    throw new Error(`${cmdName} command expects name and url arguments`);
  }
  const currrentUser: SelectUser = await getCurrentUser();

  const result: SelectFeed = await addFeed(
    args[0].trim(),
    args[1].trim(),
    currrentUser,
  );

  printFeed(result, currrentUser);
}
//
export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  try {
    await printFeeds();
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
}
//
export async function handlerFollowFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a url argument`);
  }

  const currentUser = await getCurrentUser();
  const feed = await getFeedByURL(args[0].trim());
  if (currentUser && feed) {
    await createFeedFollow(feed, currentUser);
  } else {
    console.log('There was an unknown error while following that feed!');
  }
}

export async function handlerFollowing(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const currentUser = await getCurrentUser();
  const result = await selectFollowsByUser(currentUser);

  console.log(`${currentUser.name} Follows:`);
  let i = 0;
  for (const feed of result.feedData) {
    i++;
    console.log(`  ${i}. ${feed.name} - (${feed.url})`);
  }
}

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const cleanName = cmdName.trim();
  const command = registry[cleanName];

  if (!command) {
    throw new Error(`Unknown command: ${cleanName}`);
  }

  await command(cleanName, ...args);
}
