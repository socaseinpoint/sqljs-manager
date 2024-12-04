import { DatabaseManager } from "../../src/databaseManager";
import { exportDump, importDump } from "../../src/dumpHandler";

describe("DumpHandler", () => {
  let dbManager: DatabaseManager;

  beforeEach(async () => {
    dbManager = new DatabaseManager(false);
    const schema = [
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY,
        date TEXT,
        amount REAL
      )`,
    ];
    await dbManager.initialize(schema);
  });

  it("should export and re-import encrypted database", async () => {
    dbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);
  
    // Export the database
    const dump = await dbManager.exportDatabase();
  
    // Create a new DatabaseManager instance and import the dump
    const newDbManager = new DatabaseManager(false);
    await newDbManager.importDatabase(dump);
  
    // Verify data consistency
    const result = newDbManager.execute("SELECT * FROM expenses");
    expect(result[0]?.values).toEqual([[1, "2023-12-03", 100]]);
  });
});
