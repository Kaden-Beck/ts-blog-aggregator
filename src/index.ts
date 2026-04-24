import {
  handlerLogin,
  registerCommand,
  runCommand,
  type CommandsRegistry,
} from './commands';

function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, 'login', handlerLogin);

  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    throw new Error('No command provided');
  }

  runCommand(registry, cmdName, ...args);
}

main();
