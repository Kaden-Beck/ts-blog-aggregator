import type { InferSelectModel } from 'drizzle-orm';
import { users } from './db/schema/schema';
import {
  createUser,
  deleteAllUsers,
  getUserByName,
} from './db/queries/queryUsers';
import { setUser } from '../config';

// Infered Drizzle Type
export type User = InferSelectModel<typeof users>;

export async function loginUser(username: string): Promise<User> {
  const result = await getUserByName(username);

  if (!result) {
    throw new Error(`User "${username}" does not exist.`);
  }

  setUser(result.name);
  return result;
}

export async function registerUser(name: string): Promise<User> {
  if (await getUserByName(name)) {
    throw new Error(`A user with the name "${name}" already exists.`);
  }
  return createUser(name);
}

export async function clearUsers(): Promise<void> {
  try {
    await deleteAllUsers();
    console.log('Exit Code: 0, Users table reset');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Exit Code: 1, Issue resetting users table: ${msg}`);
  }
}
