import type { InferSelectModel } from 'drizzle-orm';
import { users } from './db/schema/schema';
import { createUser, deleteAllUsers, getUserByName } from './db/queries/users';
import { setUser } from '../config';

// Infered Drizzle Type
export type User = InferSelectModel<typeof users>;

// Login current user
export async function loginUser(username: string): Promise<User> {
  const result: User = await getUserByName(username);

  if (result === null) {
    throw new Error('User cannot login to an account that does not exist!');
  }

  setUser(result.name);

  return result;
}

// Register user given a name string
export async function registerUser(name: string): Promise<User | void> {
  // Try to create a user with string, first checking if user exists
  try {
    // Check is user exists
    if ((await getUserByName(name)) != null) {
      throw Error('A user with that name already exists!');
    }

    return await createUser(name);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`There was an error registering the user: ${err.name}`);
      throw new Error(`Error registering user, ${err.message}`);
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
