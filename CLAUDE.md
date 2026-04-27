# ts-blog-aggregator

## Current focus

Hardening and testing existing functionality. Do not add new features unless explicitly asked.

## Error handling rules

### Check before acting — don't catch constraint violations

For any operation that could violate a unique constraint (user name, feed URL, post URL, feedFollower userId+feedId), check for the existing record upfront and return a clean user-facing message. Do not rely on catching a DB error after the fact.

```ts
// Good
const existing = await getFeedByURL(url);
if (existing) {
  console.log(`A feed with that URL already exists: ${existing.name}`);
  return existing;
}

// Bad — swallows the real error, exposes internal details
try {
  await createFeed(...);
} catch (err) {
  console.error(`Error: ${err.name}: ${err.message}`);
}
```

### onConflictDoNothing for idempotent upserts

For operations where duplicates are expected and should be silently skipped (e.g. re-scraping posts that already exist), use `.onConflictDoNothing()` rather than a pre-check or try/catch.

```ts
await db.insert(posts).values({...}).onConflictDoNothing().returning();
```

### Let DB errors propagate from query functions

Query functions (in `src/lib/db/queries/`) should not wrap operations in try/catch. Let errors propagate to the caller, which has enough context to give the user a meaningful message.

### User-facing messages

- Never expose `err.name`, raw SQL, or Drizzle query strings to the user.
- Messages should state what the user can do differently, not what went wrong internally.

## Return types

Drizzle's array destructuring `const [result] = ...` returns `undefined` when no rows match — not `null`. Return types for single-row query functions must be `T | undefined`, not `T`.

## Schema unique constraints

| Table | Unique columns |
|---|---|
| `users` | `name` |
| `feeds` | `url` |
| `posts` | `url` |
| `feed_followers` | `(userId, feedId)` |
