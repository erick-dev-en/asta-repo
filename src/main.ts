import Model from "../src/core/model.ts";
import DatabaseConnection from "../src/core/connection.ts";
import "@std/dotenv/load";

const databaseOptions = {
    user: Deno.env.get("DB_USER") || "",
    password: Deno.env.get("DB_PASSWORD") || "",
    database: Deno.env.get("DB_NAME") || "",
    hostname: Deno.env.get("DB_HOST") || "",
    port: parseInt(Deno.env.get("DB_PORT") || "")
};

const db = new DatabaseConnection(databaseOptions);
Model.connection = db;

class User extends Model {
    static override tableName = "users";

    static setupRelations() {
        this.defineRelation("posts", {
            type: "one-to-many",
            targetModel: Post,
            localKey: "id",
            foreignKey: "user_id",
        });
    }
}

class Post extends Model {
    static override tableName = "posts";

    static setupRelations() {
        this.defineRelation("user", {
            type: "one-to-one",
            targetModel: User,
            localKey: "user_id",
            foreignKey: "id",
        });
    }
}

User.setupRelations();
Post.setupRelations();

const user = await User.findById(1);
const posts = await user?.loadRelation("posts");
console.log(posts);

const post = await Post.findById(1);
const userForPost = await post?.loadRelation("user");
console.log(userForPost);
