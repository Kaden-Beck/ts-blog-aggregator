import type { CommandsRegistry } from './commands';

import {
  handlerRegister,
  handlerLogin,
  registerCommand,
  runCommand,
  handlerReset,
  handlerUsers,
} from './commands';

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, 'login', handlerLogin);
  registerCommand(registry, 'register', handlerRegister);
  registerCommand(registry, 'reset', handlerReset);
  registerCommand(registry, 'users', handlerUsers);

  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    throw new Error('No command provided');
  }

  await runCommand(registry, cmdName, ...args);
  process.exit(0);
}

main();
