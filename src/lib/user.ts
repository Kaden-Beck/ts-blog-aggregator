import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from './db/schema/schema';
import {
  createUser,
  deleteAllUsers,
  getUserByName,
} from './db/queries/users';
import { setUser } from '../config';

// Infered Drizzle Types
export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export async function loginUser(username: string): Promise<SelectUser> {
  const result: SelectUser = await getUserByName(username);

  if (result === null) {
    throw new Error('User cannot login to an account that does not exist!');
  }

  setUser(result.name);

  return result;
}

export async function registerUser(name: string): Promise<SelectUser | void> {
  if ((await getUserByName(name)) != null) {
    throw Error('A user with that name already exists!');
  }

  try {
    return await createUser(name);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error registering user, ${err.message}`);
    } else {
      console.error('Error registering user');
    }
  }
}

export async function clearUsers(): Promise<void> {
  try {
    await deleteAllUsers();
    console.log('Exit Code: 0, Users table reset');
  } catch {
    console.error('Exit Code: 1, Issue resetting users table');
  }
}
