import { DatabaseManager } from "../../src/databaseManager";
import { applyMigrations, Migration } from "../../src/migrations";

describe("Migrations", () => {
  let dbManager: DatabaseManager;

  beforeEach(async () => {
    dbManager = new DatabaseManager(false);
    const schema = [
      `CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY,
        version INTEGER
      )`,
    ];
    await dbManager.initialize(schema);
  });

  it("should apply migrations", async () => {
    const migrations: Migration[] = [
      {
        version: 1,
        queries: [
          `CREATE TABLE expenses (
            id INTEGER PRIMARY KEY,
            date TEXT,
            amount REAL
          )`,
        ],
      },
      {
        version: 2,
        queries: [`ALTER TABLE expenses ADD COLUMN category TEXT`],
      },
    ];

    await applyMigrations(dbManager, migrations);

    const result = dbManager.execute(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    expect(result[0]?.values).toContainEqual(["expenses"]);

    const versionResult = dbManager.execute(
      "SELECT MAX(version) FROM schema_version"
    );
    expect(versionResult[0]?.values[0][0]).toBe(2);
  });
});
