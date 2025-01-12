type Order = "ASC" | "DESC";

class QueryBuilder {
    private selectFields: string[] = [];
    private tableName: string | null = null;
    private whereConditions: string[] = [];
    private orderByFields: { field: string; order: Order }[] = [];
    private limitValue: number | null = null;
    private params: unknown[] = [];

    select(fields: string[]) {
        this.selectFields = fields;
        return this;
    }

    from(table: string) {
        this.tableName = table;
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

    build() {
        if (!this.tableName) {
            throw new Error("Table name must be specified with `from()`.");
        }

        const query: string[] = [];
        query.push(
            `SELECT ${this.selectFields.length > 0 ? this.selectFields.join(", ") : "*"}`
        );

        query.push(`FROM ${this.tableName}`);

        if (this.whereConditions.length > 0) {
            query.push(`WHERE ${this.whereConditions.join(" AND ")}`);
        }

        if (this.orderByFields.length > 0) {
            const orderBy = this.orderByFields
                .map(({ field, order }) => `${field} ${order}`)
                .join(", ");
            query.push(`ORDER BY ${orderBy}`);
        }

        if (this.limitValue !== null) {
            query.push(`LIMIT ${this.limitValue}`);
        }

        return {
            text: query.join(" "),
            params: this.params,
        };
    }
}

export default QueryBuilder;
