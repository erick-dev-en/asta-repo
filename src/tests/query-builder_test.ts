import QueryBuilder from "../core/query-builder.ts";

const query = new QueryBuilder()
  .from("users")
  .join("INNER", "posts", "users.id = posts.user_id")
  .join("LEFT", "comments", "posts.id = comments.post_id")
  .select(["users.name", "posts.title", "comments.content"])
  .build();

console.log(query.text);
// SELECT users.name, posts.title, comments.content
// FROM users
// INNER JOIN posts ON users.id = posts.user_id
// LEFT JOIN comments ON posts.id = comments.post_id
