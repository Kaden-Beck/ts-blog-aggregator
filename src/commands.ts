import { setUser } from './config';

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

/*
  npm run start login <username> -> sets the user in config file to <username>
*/

export function handlerLogin(cmdName: string, ...args: string[]): void {
  if (args.length === 0) {
    throw new Error(`${cmdName} command expects a username argument`);
  }

  const username = args[0].trim();
  setUser(username);

  console.log(`User set to ${username}`);
}

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

export function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): void {
  const cleanName = cmdName.trim();
  const command = registry[cleanName];

  if (!command) {
    throw new Error(`Unknown command: ${cleanName}`);
  }

  command(cleanName, ...args);
}
