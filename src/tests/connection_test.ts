import DatabaseConnection from "../core/connection.ts";
import "@std/dotenv/load";

const databaseOptions = {
  user: Deno.env.get("DB_USER") || "",
  password: Deno.env.get("DB_PASSWORD") || "",
  database: Deno.env.get("DB_NAME") || "", 
  hostname: Deno.env.get("DB_HOST") || "",
  port: parseInt(Deno.env.get("DB_PORT") || "")
};

const db = new DatabaseConnection(databaseOptions);

try {
  await db.connect();
  const result = await db.getClient().queryArray("SELECT NOW();");
  console.log("Current Time:", result.rows[0]);
} finally {
  await db.disconnect();
}
