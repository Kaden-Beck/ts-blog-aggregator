import type {
  CommandHandler,
  CommandsRegistry,
  UserCommandHandler,
} from './commands';
import {
  handlerRegister,
  handlerLogin,
  registerCommand,
  runCommand,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollowFeed,
  handlerFollowing,
  handlerUnfollow,
  handlerBrowse
} from './commands';

type Commands = Array<
  [
    cmdName: string,
    handler: CommandHandler | UserCommandHandler,
    authRequired: boolean,
    description: string,
  ]
>;

const commands: Commands = [
  ['login',     handlerLogin,      false, 'login <username>            — set the active user'],
  ['register',  handlerRegister,   false, 'register <username>         — create a new user account'],
  ['reset',     handlerReset,      false, 'reset                       — delete all users (destructive)'],
  ['users',     handlerUsers,      false, 'users                       — list all registered users'],
  ['agg',       handlerAgg,        false, 'agg <interval>              — start scraping feeds on an interval (e.g. 1m, 30s)'],
  ['addfeed',   handlerAddFeed,    true,  'addfeed <name> <url>        — add a new feed and follow it'],
  ['feeds',     handlerFeeds,      false, 'feeds                       — list all feeds in the database'],
  ['follow',    handlerFollowFeed, true,  'follow <url>                — follow a feed by URL'],
  ['following', handlerFollowing,  true,  'following                   — list feeds the current user follows'],
  ['unfollow',  handlerUnfollow,   true,  'unfollow <url>              — unfollow a feed by URL'],
  ['browse',    handlerBrowse,     true,  'browse [limit]              — show recent posts from followed feeds (default: 2)'],
];

function buildCommandRegistry(commands: Commands): CommandsRegistry {
  const commandRegistry: CommandsRegistry = {};

  commandRegistry['help'] = async () => {
    console.log('Usage: npm run start <command> [args]\n');
    for (const [, , , description] of commands) {
      console.log(`  ${description}`);
    }
  };

  for (const command of commands) {
    registerCommand(commandRegistry, command);
  }

  return commandRegistry;
}

function parseCommand(): [string, ...string[]] {
  const [cmdName = 'help', ...args] = process.argv.slice(2);
  return [cmdName, ...args];
}

async function main() {
  // Generarte the Commands Registry
  const commandRegistry = buildCommandRegistry(commands);
  // Parse command args
  const [cmdName, ...args] = parseCommand();
  // Attempt to run commands=
  await runCommand(commandRegistry, cmdName, ...args);
  process.exit(0);
}

main();
