import { DatabaseManager } from "./databaseManager";
import { StorageManager } from "./storageManager";


export class SecuredDatabaseManager extends DatabaseManager {
  private password: string | null = null;

  constructor() {
    super(true); // Enable encryption by default
  }

  /**
   * Sets the user's password and initializes the encryption manager with it.
   * @param password - The user's password.
   */
  async setPassword(password: string): Promise<void> {
    this.password = password;
  }

  private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    return new Uint8Array(await crypto.subtle.exportKey("raw", derivedKey));
  }

  async exportSecuredDatabase(): Promise<{ iv: Uint8Array; encrypted: Uint8Array; salt: Uint8Array }> {
    if (!this.password) {
      throw new Error("Password not set. Call setPassword() first.");
    }

    // Generate a random salt for this export
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.deriveKeyFromPassword(this.password, salt);
    await this.encryptionManager?.importKey(key);

    const dump = (await super.exportDatabase()) as { iv: Uint8Array; encrypted: Uint8Array };

    return { ...dump, salt }; // Include salt in the exported dump
  }

  async importSecuredDatabase(dump: { iv: Uint8Array; encrypted: Uint8Array; salt: Uint8Array }): Promise<void> {
    if (!this.password) {
      throw new Error("Password not set. Call setPassword() first.");
    }

    // Use the salt from the dump to derive the decryption key
    const key = await this.deriveKeyFromPassword(this.password, dump.salt);
    await this.encryptionManager?.importKey(key);

    await super.importDatabase(dump);
  }

    /**
   * Saves the encrypted database to local storage.
   */
    async saveToLocalStorage(): Promise<void> {
      console.log("Exporting secured database...");
      const dump = await this.exportSecuredDatabase();
      console.log("Dump exported:", dump);
      console.log("Saving to local storage...");
      await StorageManager.saveEncryptedDump(dump);
      console.log("Saved to local storage.");
    }
  
    /**
     * Loads the encrypted database from local storage.
     * @param password - The password to decrypt the database.
     */
    async loadFromLocalStorage(password: string): Promise<void> {
      console.log("Loading from local storage...");
      const dump = await StorageManager.loadEncryptedDump();
      console.log("Dump loaded:", dump);
    
      if (!dump) {
        console.error("No encrypted database dump found.");
        throw new Error("No encrypted database dump found in local storage."); // Явно выбрасываем исключение
      }
    
      await this.setPassword(password);
      console.log("Password set. Importing database...");
      await this.importSecuredDatabase(dump);
      console.log("Database imported.");
    }    
}
