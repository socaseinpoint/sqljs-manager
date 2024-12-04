import 'fake-indexeddb/auto';
// jest.setTimeout(5000); // Увеличиваем тайм-аут до 5 секунд


import { SecuredDatabaseManager } from "../../src/secureDatabaseManager";
import { StorageManager } from "../../src/storageManager";


describe("SecuredDatabaseManager", () => {
  let securedDbManager: SecuredDatabaseManager;

  beforeEach(async () => {
    await StorageManager.clearStorage();
    securedDbManager = new SecuredDatabaseManager();
    await securedDbManager.setPassword("secure-password"); // Set a password for encryption
    const schema = [
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY,
        date TEXT,
        amount REAL
      )`,
    ];
    await securedDbManager.initialize(schema);
  });

  it("should clear storage without errors", async () => {
    await StorageManager.clearStorage();
    expect(true).toBe(true); // Проверяем, что метод завершается без ошибок
  });

  afterEach(async () => {
    console.log("Clearing storage in afterEach...");
    await StorageManager.clearStorage();
    console.log("Storage cleared successfully.");
  });

  it("should initialize database with schema", async () => {
    const result = securedDbManager.execute(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    expect(result[0]?.values).toContainEqual(["expenses"]);
  });

  it("should allow inserting and querying data", () => {
    securedDbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);
    const result = securedDbManager.execute("SELECT * FROM expenses");
    expect(result[0]?.values).toEqual([[1, "2023-12-03", 100]]);
  });

  it("should export an encrypted database", async () => {
    securedDbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);

    const encryptedDump = await securedDbManager.exportSecuredDatabase();

    expect(encryptedDump).toHaveProperty("iv");
    expect(encryptedDump).toHaveProperty("encrypted");
    expect(encryptedDump.iv).toBeInstanceOf(Uint8Array);
    expect(encryptedDump.encrypted).toBeInstanceOf(Uint8Array);
  });

  it("should export and re-import an encrypted database and retain data", async () => {
    securedDbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);

    const encryptedDump = await securedDbManager.exportSecuredDatabase();

    const newSecuredDbManager = new SecuredDatabaseManager();
    await newSecuredDbManager.setPassword("secure-password");
    await newSecuredDbManager.importSecuredDatabase(encryptedDump);

    const result = newSecuredDbManager.execute("SELECT * FROM expenses");
    expect(result[0]?.values).toEqual([[1, "2023-12-03", 100]]);
  });

  it("should fail to decrypt with an incorrect password", async () => {
    securedDbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);

    const encryptedDump = await securedDbManager.exportSecuredDatabase();

    const newSecuredDbManager = new SecuredDatabaseManager();
    await newSecuredDbManager.setPassword("wrong-password");

    await expect(
      newSecuredDbManager.importSecuredDatabase(encryptedDump)
    ).rejects.toThrow("Decryption failed. Ensure the IV and key are correct.");
  });

  it("should throw an error if password is not set before exporting", async () => {
    const unsecuredDbManager = new SecuredDatabaseManager();
    await unsecuredDbManager.initialize([]);

    await expect(unsecuredDbManager.exportSecuredDatabase()).rejects.toThrow(
      "Password not set. Call setPassword() first."
    );
  });

  it("should throw an error if password is not set before importing", async () => {
    const unsecuredDbManager = new SecuredDatabaseManager();

    const encryptedDump = await securedDbManager.exportSecuredDatabase();

    await expect(unsecuredDbManager.importSecuredDatabase(encryptedDump)).rejects.toThrow(
      "Password not set. Call setPassword() first."
    );
  });

  it("should save and load database from local storage", async () => {
    securedDbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", [
      "2023-12-03",
      100,
    ]);

    await securedDbManager.saveToLocalStorage();

    const newDbManager = new SecuredDatabaseManager();
    await newDbManager.loadFromLocalStorage("secure-password");

    const result = newDbManager.execute("SELECT * FROM expenses");
    expect(result[0]?.values).toEqual([[1, "2023-12-03", 100]]);
  });

  it("should throw an error when loading without a saved dump", async () => {
    try {
      console.log("Attempting to load from local storage...");
      await securedDbManager.loadFromLocalStorage("secure-password");
    } catch (error) {
      console.log("Caught error:", error);
      if (error instanceof Error) {
        expect(error.message).toBe("No encrypted database dump found in local storage.");
      } else {
        throw new Error("Caught an unknown error type.");
      }
      return;
    }
  
    throw new Error("Method did not throw an error as expected.");
  });
});
