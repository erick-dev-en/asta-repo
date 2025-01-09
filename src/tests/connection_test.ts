import DatabaseConnection from "../core/connection.ts";

const dbOptions = {
  user: "postgres",
  password: "user.root",
  database: "deno_db",
  hostname: "localhost",
  port: 5432,
};

const db = new DatabaseConnection(dbOptions);

try {
  await db.connect();
  const result = await db.getClient().queryArray("SELECT NOW();");
  console.log("Current Time:", result.rows[0]);
} finally {
  await db.disconnect();
}
