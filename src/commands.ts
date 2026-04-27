import { readConfig, setUser } from './config';
import { getFeedByURL } from './lib/db/queries/queryFeeds';
import {
  deleteFeedFollow,
  selectFollowsByUser,
} from './lib/db/queries/queryFeedFollow';
import { getCurrentUser, getUsers } from './lib/db/queries/queryUsers';
import { addFeed, printFeed, printFeeds } from './lib/feed';
import { fetchRSSFeed, parseXML } from './lib/rss';
import { clearUsers, loginUser, registerUser } from './lib/user';
import { createFeedFollow } from './lib/feedFollower';
import { aggregate } from './lib/aggregate';

import type { User } from './lib/user';
import type { Feed } from './lib/feed';
import { getPostsForUser } from './lib/db/queries/queryPosts';

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

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
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
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a time_between_reqs argument`);
  }

  await aggregate(args[0].trim());
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

  const result: Feed | null = await addFeed(
    args[0].trim(),
    args[1].trim(),
    user,
  );

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

  const url = args[0].trim();
  const existing = await getFeedByURL(url);
  if (existing) {
    await createFeedFollow(existing, user);
    return;
  }

  const rssData = await fetchRSSFeed(url);
  if (!rssData) {
    throw new Error(`Could not fetch RSS feed at: ${url}`);
  }
  const name = parseXML(rssData).channel.title;
  await addFeed(name, url, user);
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

// Handle deleting a follow for current user
export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ..._args: string[]
): Promise<void> {
  if (_args.length === 0) {
    console.error(`Missing the feed URL for ${cmdName}`);
    return;
  }

  const result = await deleteFeedFollow(user, _args[0]);
  if (result) {
    console.log(`User ${user.name} succesfully unfollowed ${result[1].name}.`);
  }
}

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ..._args: string[]
): Promise<void> {
  let limit: number = 2;

  if (_args.length > 0 && !isNaN(Number(_args[0].trim()))) {
    limit = Number(_args[0].trim());
  }

  const result = await getPostsForUser
  (user, limit);
}
