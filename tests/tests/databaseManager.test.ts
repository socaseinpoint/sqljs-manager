import { DatabaseManager } from "../../src/databaseManager";

describe("DatabaseManager", () => {
  let dbManager: DatabaseManager;

  beforeEach(async () => {
    dbManager = new DatabaseManager(false); // Without encryption for testing
    const schema = [
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY,
        date TEXT,
      amount REAL
      )`,
    ];
    await dbManager.initialize(schema);
  });

  it("should initialize database with schema", async () => {
    const result = dbManager.execute("SELECT name FROM sqlite_master WHERE type='table'");
    expect(result[0]?.values).toContainEqual(["expenses"]);
  });

  it("should allow inserting and querying data", () => {
    dbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);
    const result = dbManager.execute("SELECT * FROM expenses");
    expect(result[0]?.values).toEqual([[1, "2023-12-03", 100]]);
  });

  it("should export and re-import database", async () => {
    dbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);
    const dump = await dbManager.exportDatabase();
    const newDbManager = new DatabaseManager(false);
    await newDbManager.importDatabase(dump);

    const result = newDbManager.execute("SELECT * FROM expenses");
    expect(result[0]?.values).toEqual([[1, "2023-12-03", 100]]);
  });
});
