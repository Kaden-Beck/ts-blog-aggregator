import { argon2Sync } from 'node:crypto';
import { readConfig, setUser } from './config';
import {
  createUser,
  deleteAllUser,
  getUserByName,
  getUsers,
} from './lib/db/queries/users';
import { resourceLimits } from 'node:worker_threads';
import { fetchRSSFeed, parseXML, RSSFeed } from './rss';

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
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a username argument`);
  }
  const username = args[0].trim();

  if ((await getUserByName(username)) == null) {
    throw new Error('User cannot login to an account that does not exist!');
  } else {
    setUser(username);
    console.log(`User set to ${username}`);
  }
}

// > register {name} -> createUser(name) => result
export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a name argument`);
  }
  const name = args[0].trim();

  if ((await getUserByName(name)) != null) {
    throw Error('A user with that name already exists');
  }

  const result = await createUser(name);
  setUser(name);
  console.log(`User "${name}" was added.\n${JSON.stringify(result, null, 2)}`);
}

// > reset -> resets user table rows
export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  try {
    await deleteAllUser();
    console.log('Exit Code: 0, Users table reset');
  } catch {
    console.log('Exit Code: 1, Issue resetting users table');
  }
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

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const rawXML = await fetchRSSFeed('https://www.wagslane.dev/index.xml');
  const parsedXML: RSSFeed = parseXML(rawXML);

  console.log(JSON.stringify(parsedXML, null, 2));
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
