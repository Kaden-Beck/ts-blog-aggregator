import { eq } from 'drizzle-orm';
import { db } from '..';
import { users } from '../schema/schema';

import { readConfig } from '../../../config';
import { User } from '../../user';

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string): Promise<User | undefined> {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result;
}

export async function getCurrentUser(): Promise<User> {
  const config = readConfig();
  const result = await getUserByName(config.currentUserName);

  if (!result) {
    throw new Error(`User ${config.currentUserName} not found`);
  }

  return result;
}

export async function getUsers(): Promise<User[]> {
  const result = await db.select().from(users);
  return result;
}

export async function deleteAllUsers(): Promise<void> {
  await db.delete(users);
}
