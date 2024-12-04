import { EncryptionManager } from "../../src/encryption";

describe("EncryptionManager", () => {
  let encryptionManager: EncryptionManager;

  beforeEach(async () => {
    encryptionManager = new EncryptionManager();
    await encryptionManager.generateKey();
  });

  it("should encrypt and decrypt data", async () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    const { iv, encrypted } = await encryptionManager.encrypt(data);
    const decrypted = await encryptionManager.decrypt({ iv, encrypted });

    expect(decrypted).toEqual(data);
  });

  it("should export and import key", async () => {
    const rawKey = await encryptionManager.exportKey();
    const newEncryptionManager = new EncryptionManager();
    await newEncryptionManager.importKey(rawKey);

    const data = new Uint8Array([1, 2, 3, 4]);
    const { iv, encrypted } = await newEncryptionManager.encrypt(data);
    const decrypted = await newEncryptionManager.decrypt({ iv, encrypted });

    expect(decrypted).toEqual(data);
  });
});
