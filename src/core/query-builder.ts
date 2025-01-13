type Order = "ASC" | "DESC";

class QueryBuilder {
    private tableName: string | null = null;
    private selectFields: string[] = [];
    private whereConditions: string[] = [];
    private orderByFields: { field: string; order: Order }[] = [];
    private limitValue: number | null = null;
    private params: unknown[] = [];
    private insertData: Record<string, unknown> | null = null;
    private updateData: Record<string, unknown> | null = null;
    private joins: string[] = [];

    from(table: string) {
        this.tableName = table;
        return this;
    }

    select(fields: string[]) {
        this.selectFields = fields;
        return this;
    }

    where(condition: string, params: unknown[] = []) {
        this.whereConditions.push(condition);
        this.params.push(...params);
        return this;
    }

    orderBy(field: string, order: Order = "ASC") {
        this.orderByFields.push({ field, order });
        return this;
    }

    limit(value: number) {
        this.limitValue = value;
        return this;
    }

    insert(data: Record<string, unknown>) {
        this.insertData = data;
        return this;
    }

    update(data: Record<string, unknown>) {
        this.updateData = data;
        return this;
    }

    delete() {
        return this;
    }

    join(type: "INNER" | "LEFT" | "RIGHT" | "FULL", table: string, on: string): this {
        this.joins.push(`${type} JOIN ${table} ON ${on}`);
        return this;
    }

    build(): { text: string; params: unknown[] } {
        if (!this.tableName) {
            throw new Error("Table name must be specified with `from()`.");
        }

        if (this.insertData) {
            // INSERT query
            const keys = Object.keys(this.insertData);
            const values = Object.values(this.insertData);
            const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
            return {
                text: `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`,
                params: values,
            };
        }

        if (this.updateData) {
            // UPDATE query
            const keys = Object.keys(this.updateData);
            const values = Object.values(this.updateData);
            const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
            const whereClause = this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(" AND ")}` : "";
            return {
                text: `UPDATE ${this.tableName} SET ${setClause} ${whereClause} RETURNING *`,
                params: [ ...values, ...this.params ],
            };
        }

        if (this.whereConditions.length > 0 && this.delete()) {
            // DELETE query
            const whereClause = this.whereConditions.join(" AND ");
            return {
                text: `DELETE FROM ${this.tableName} WHERE ${whereClause}`,
                params: this.params,
            };
        }

        const selectClause = `SELECT ${this.selectFields.length > 0 ? this.selectFields.join(", ") : "*"}`;
        const joinClause = this.joins.length > 0 ? this.joins.join(" ") : "";
        const whereClause = this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(" AND ")}` : "";
        const orderByClause = this.orderByFields.length > 0
            ? `ORDER BY ${this.orderByFields.map(({ field, order }) => `${field} ${order}`).join(", ")}`
            : "";
        const limitClause = this.limitValue !== null ? `LIMIT ${this.limitValue}` : "";

        return {
            text: `${selectClause} FROM ${this.tableName} ${joinClause} ${whereClause} ${orderByClause} ${limitClause}`,
            params: this.params,
        };
    }
}

export default QueryBuilder;
