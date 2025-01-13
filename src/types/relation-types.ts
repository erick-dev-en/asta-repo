import Model from "../core/model.ts";

type RelationType = "one-to-one" | "one-to-many" | "many-to-many";

export interface RelationConfig {
    type: RelationType;
    targetModel: typeof Model;
    localKey?: string;
    foreignKey?: string;
    throughTable?: string; // (To M:N)
    throughLocalKey?: string; // (To M:N) Local key
    throughForeignKey?: string; // (To M:N) Foreign key
}