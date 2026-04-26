import type { CommandHandler, CommandsRegistry, UserCommandHandler } from './commands';
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
} from './commands';

type Commands = Array<
  [cmdName: string, handler: CommandHandler | UserCommandHandler, authRequired: boolean]
>;

const commands: Commands = [
  ['login', handlerLogin, false],
  ['register', handlerRegister, false],
  ['reset', handlerReset, false],
  ['users', handlerUsers, false],
  ['agg', handlerAgg, false],
  ['addfeed', handlerAddFeed, true],
  ['feeds', handlerFeeds, false],
  ['follow', handlerFollowFeed, true],
  ['following', handlerFollowing, true],
];

function buildCommandRegistry(commands: Commands): CommandsRegistry {
  const commandRegistry: CommandsRegistry = {};

  for (const command of commands) {
    registerCommand(commandRegistry, command);
  }

  return commandRegistry;
}

function parseCommand(): [string, ...string[]] {
  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    throw new Error('No command provided');
  }

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
