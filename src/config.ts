import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

function getConfigFilePath(): string {
  return join(homedir(), '.gatorconfig.json');
}

function getFallbackConfigFilePath(): string {
  return join(process.cwd(), '.gatorconfig.json');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isConfig(value: unknown): value is Config {
  return (
    isRecord(value) &&
    typeof value.dbUrl === 'string' &&
    typeof value.currentUserName === 'string'
  );
}

function parseConfig(rawConfig: string): Config | null {
  let parsedConfig: unknown;

  try {
    parsedConfig = JSON.parse(rawConfig);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error parsing config: ${err.message}`);
    } else {
      console.log('Error parsing config');
    }
  }

  if (isConfig(parsedConfig)) {
    return parsedConfig as Config;
  }

  return null;
}

function writeConfig(config: Config): void {
  const serialized = JSON.stringify(config, null, 2);

  try {
    writeFileSync(getConfigFilePath(), serialized, 'utf8');
  } catch (err) {
    const fallbackPath = getFallbackConfigFilePath();

    try {
      writeFileSync(fallbackPath, serialized, 'utf8');
      console.warn(
        `Home config path is not writable. Wrote config to ${fallbackPath} instead.`,
      );
      return;
    } catch {
      if (err instanceof Error) {
        throw new Error(`Failed to write config: ${err.message}`);
      }
      throw new Error('Failed to write config');
    }
  }
}

export function setUser(userName: string): void {
  const config: Config = {
    dbUrl: 'postgres://example',
    currentUserName: userName,
  };

  writeConfig(config);
}

export function readConfig(): Config {
  const candidatePaths = [getConfigFilePath(), getFallbackConfigFilePath()];

  for (const path of candidatePaths) {
    try {
      const rawConfig = readFileSync(path, 'utf8');
      const config = parseConfig(rawConfig);

      if (config !== null) {
        return config;
      }
    } catch {
      // Keep trying candidate locations.
    }
  }

  throw new Error('Failed to read a valid config file');
}
