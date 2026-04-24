import {
  handlerLogin,
  registerCommand,
  runCommand,
  type CommandsRegistry,
} from './commands';

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, 'login', handlerLogin);

  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    throw new Error('No command provided');
  }

  await runCommand(registry, cmdName, ...args);
  process.exit(0);
}

main();
