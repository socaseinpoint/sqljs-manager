import { StorageManager } from "../../src/storageManager";

describe("StorageManager", () => {
  const testDump = {
    iv: new Uint8Array([1, 2, 3]),
    encrypted: new Uint8Array([4, 5, 6]),
    salt: new Uint8Array([7, 8, 9]),
  };

  beforeEach(async () => {
    await StorageManager.clearStorage();
  });

  it("should save and load an encrypted dump", async () => {
    await StorageManager.saveEncryptedDump(testDump);

    const loadedDump = await StorageManager.loadEncryptedDump();

    expect(loadedDump).toEqual(testDump);
  });

  it("should return null if no dump is found", async () => {
    const loadedDump = await StorageManager.loadEncryptedDump();

    expect(loadedDump).toBeNull();
  });

  it("should clear storage", async () => {
    await StorageManager.saveEncryptedDump(testDump);
    await StorageManager.clearStorage();

    const loadedDump = await StorageManager.loadEncryptedDump();

    expect(loadedDump).toBeNull();
  });
});
