import type { CommandHandler, CommandsRegistry } from './commands';

import {
  handlerRegister,
  handlerLogin,
  registerCommand,
  runCommand,
  handlerReset,
  handlerUsers,
  handlerAgg,
} from './commands';

const commands: Array<[cmdName: string, handler: CommandHandler]> = [
  ['login', handlerLogin],
  ['register', handlerRegister],
  ['reset', handlerReset],
  ['users', handlerUsers],
  ['agg', handlerAgg],
];

const command: { registry: any }[] = [];

async function main() {
  const registry: CommandsRegistry = {};
  for (const command of commands) {
    registerCommand(registry, command[0], command[1]);
  }

  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    throw new Error('No command provided');
  }

  await runCommand(registry, cmdName, ...args);
  process.exit(0);
}

main();
