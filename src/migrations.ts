import { DatabaseManager } from "./databaseManager";

export interface Migration {
  version: number;
  queries: string[];
}

export async function applyMigrations(
  dbManager: DatabaseManager,
  migrations: Migration[]
): Promise<void> {
  const currentVersion = dbManager.execute(`
    SELECT MAX(version) as version FROM schema_version
  `)[0]?.values[0][0] || 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      migration.queries.forEach((query) => dbManager.execute(query));
      dbManager.execute(
        `INSERT INTO schema_version (version) VALUES (?)`,
        [migration.version]
      );
    }
  }
}
