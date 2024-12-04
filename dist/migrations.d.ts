import { DatabaseManager } from "./databaseManager";
export interface Migration {
    version: number;
    queries: string[];
}
export declare function applyMigrations(dbManager: DatabaseManager, migrations: Migration[]): Promise<void>;
