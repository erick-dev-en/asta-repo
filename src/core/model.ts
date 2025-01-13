import DatabaseConnection from "../core/connection.ts";
import QueryBuilder from "../core/query-builder.ts";
import { RelationConfig } from "../types/relation-types.ts";

type QueryArguments = (string | number | boolean | null | Uint8Array)[];

class Model {
    id?: number;
    [ key: string ]: unknown;
    static tableName: string;
    static connection: DatabaseConnection;
    static relations: Record<string, RelationConfig> = {};

    static async findAll() {
        const query = new QueryBuilder().from(this.tableName).build();
        const client = this.connection.getClient();
        try {
            console.log("Executing query:", query.text, query.params);
            const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);
            return result.rows;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    static async findById(id: number): Promise<Model | null> {
        if (!this.connection) {
            throw new Error("Database connection is not initialized.");
        }

        const query = new QueryBuilder()
            .from(this.tableName)
            .where("id = $1", [ id ])
            .build();

        const client = this.connection.getClient();
        const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);

        if (result.rows.length === 0) return null;

        const instance = new this();
        Object.assign(instance, result.rows[ 0 ]);
        return instance;
    }


    async save() {
        const data = this as Record<string, unknown>;
        const query = new QueryBuilder().from((<typeof Model>this.constructor).tableName).insert(data).build();
        const client = (<typeof Model>this.constructor).connection.getClient();
        try {
            console.log("Executing query:", query.text, query.params);
            const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);
            Object.assign(this, result.rows[ 0 ]);
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    async update(data: Record<string, unknown>) {
        const query = new QueryBuilder()
            .from((<typeof Model>this.constructor).tableName)
            .update(data)
            .build();
        const client = (<typeof Model>this.constructor).connection.getClient();
        try {
            console.log("Executing query:", query.text, query.params);
            const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);
            Object.assign(this, result.rows[ 0 ]);
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    async delete() {
        const query = new QueryBuilder()
            .from((<typeof Model>this.constructor).tableName)
            .where("id = $1", [ this[ "id" ] ])
            .delete()
            .build();

        const client = (<typeof Model>this.constructor).connection.getClient();
        await client.queryObject(query.text, query.params as QueryArguments);
    }
    static defineRelation(name: string, config: RelationConfig) {
        this.relations[ name ] = config;
    }

    async loadRelation(relationName: string) {
        const relation = (<typeof Model>this.constructor).relations[ relationName ];
        if (!relation) {
            throw new Error(`Relation "${relationName}" is not defined on model "${(<typeof Model>this.constructor).name}".`);
        }

        const { type, targetModel, localKey, foreignKey, throughTable, throughLocalKey, throughForeignKey } = relation;

        const client = (<typeof Model>this.constructor).connection.getClient();

        switch (type) {
            case "one-to-one": {
                const query = new QueryBuilder()
                    .from(targetModel.tableName)
                    .where(`${foreignKey} = $1`, [ this[ localKey! ] ])
                    .limit(1)
                    .build();

                const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);
                return result.rows[ 0 ] || null;
            }

            case "one-to-many": {
                const query = new QueryBuilder()
                    .from(targetModel.tableName)
                    .where(`${foreignKey} = $1`, [ this[ localKey! ] ])
                    .build();

                const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);
                return result.rows;
            }

            case "many-to-many": {
                const query = new QueryBuilder()
                    .from(targetModel.tableName)
                    .join("INNER", throughTable!, `${throughTable!}.${throughForeignKey} = ${targetModel.tableName}.id`)
                    .where(`${throughTable!}.${throughLocalKey} = $1`, [ this[ localKey! ] ])
                    .build();

                const result = await client.queryObject(query.text, [ ...query.params ] as QueryArguments);
                return result.rows;
            }

            default:
                throw new Error(`Unsupported relation type: ${type}`);
        }
    }
}

export default Model;
