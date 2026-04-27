import type { InferSelectModel } from 'drizzle-orm';
import { posts } from './db/schema/schema';


// Infered Drizzle Types
export type Feed = InferSelectModel<typeof posts>;
