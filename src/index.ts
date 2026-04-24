import {
  handlerRegister,
  handlerLogin,
  registerCommand,
  runCommand,
  type CommandsRegistry,
} from './commands';

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, 'login', handlerLogin);
  registerCommand(registry, 'register', handlerRegister)

  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    throw new Error('No command provided');
  }

  await runCommand(registry, cmdName, ...args);
  process.exit(0);
}

main();
