# Boot.dev Blog Aggregator (Gator)

A TypeScript service backed by postgres to scrape RSS Feeds, Parse them with fast-xml-parser and use the Drizzle ORM to manage db relationships and data.

## Reference

[Drizzle Docs](https://orm.drizzle.team/docs/overview_)

[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser/)

## Command Overview

| Command                | Auth | Description                                        |
| ---------------------- | ---- | -------------------------------------------------- |
| `login <username>`     |      | set the active user                                |
| `register <username>`  |      | create a new user account                          |
| `reset`                |      | delete all users (destructive)                     |
| `users`                |      | list all registered users                          |
| `agg <interval>`       |      | start scraping feeds on an interval (e.g. 1m, 30s) |
| `addfeed <name> <url>` | X    | add a new feed and follow it                       |
| `feeds`                |      | list all feeds in the database                     |
| `follow <url>`         | X    | follow a feed by URL                               |
| `following`            | X    | list feeds the current user follows                |
| `unfollow <url>`       | X    | unfollow a feed by URL                             |
| `browse [limit]`       | X    | show recent posts from followed feeds (default: 2) |
