import { readConfig, setUser } from './config';
import { getFeedByURL } from './lib/db/queries/feeds';
import { selectFollowsByUser } from './lib/db/queries/feedFollow';
import { getCurrentUser, getUsers } from './lib/db/queries/users';

import { fetchRSSFeed, parseXML, RSSFeed } from './lib/rss';
import { addFeed, printFeed, printFeeds, Feed } from './lib/feed';
import { clearUsers, loginUser, registerUser, User } from './lib/user';
import { createFeedFollow } from './lib/feedFollower';

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type CommandEntry = [
  cmdName: string,
  handler: CommandHandler | UserCommandHandler,
  authRequired: boolean,
];

export type CommandsRegistry = Record<string, CommandHandler>;

/**************************
~ Standard command functions
*************************/

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const user = await getCurrentUser();
    await handler(cmdName, user, ...args);
  };
}

export function registerCommand(
  registry: CommandsRegistry,
  command: CommandEntry,
): void {
  if (command[2]) {
    registry[command[0]] = middlewareLoggedIn(command[1] as UserCommandHandler);
  } else {
    registry[command[0]] = command[1] as CommandHandler;
  }
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

/**************************
~ Handlers
*************************/

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
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 2) {
    throw new Error(`${cmdName} command expects name and url arguments`);
  }

  const result: Feed | null = await addFeed(args[0].trim(), args[1].trim(), user);

  if (result) {
    printFeed(result, user);
  } else {
    console.error('error getting feed!');
  }
}

// Handles printing current feeds in DB
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

// Handles a user following a feed
export async function handlerFollowFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a url argument`);
  }

  const feed = await getFeedByURL(args[0].trim());
  if (feed) {
    await createFeedFollow(feed, user);
  } else {
    console.log('There was an unknown error while following that feed!');
  }
}

// Handles retrieving a current user's followed feeds
export async function handlerFollowing(
  cmdName: string,
  user: User,
  ..._args: string[]
): Promise<void> {
  const result = await selectFollowsByUser(user);

  console.log(`${user.name} Follows:`);
  let i = 0;
  for (const feed of result.feedData) {
    i++;
    console.log(`  ${i}. ${feed.name} - (${feed.url})`);
  }
}
