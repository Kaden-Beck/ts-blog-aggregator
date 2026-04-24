import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config" 

const CONNECTION_STRING = readConfig().dbUrl

export default defineConfig({
  schema: "src/lib/db/schema",
  out: "src/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: CONNECTION_STRING
  },
});