export class StorageManager {
  private static dbName = "secured-db";
  private static storeName = "dumps";
  private static dbVersion = 1;

  /**
   * Ensures the database and object store are properly initialized.
   */
  private static async initialize(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      console.log("Initializing IndexedDB...");
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        console.log("Upgrade needed. Creating or verifying object store...");
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        console.log("Database initialized successfully.");
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.error("Error initializing database:", e);
        reject(e);
      };
    });
  }

  /**
   * Saves an encrypted dump to IndexedDB.
   */
  static async saveEncryptedDump(dump: { iv: Uint8Array; encrypted: Uint8Array; salt: Uint8Array }): Promise<void> {
    console.log("Saving with key: 'encryptedDump'");
    const db = await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      const putRequest = store.put({ key: "encryptedDump", value: dump });

      putRequest.onsuccess = () => {
        console.log("Dump saved successfully.");
        db.close();
        resolve();
      };

      putRequest.onerror = (e) => {
        console.error("Error saving dump:", e);
        db.close();
        reject(e);
      };
    });
  }

  /**
   * Loads an encrypted dump from IndexedDB.
   */
  static async loadEncryptedDump(): Promise<{ iv: Uint8Array; encrypted: Uint8Array; salt: Uint8Array } | null> {
    console.log("Loading with key: 'encryptedDump'");
    const db = await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);

      const getRequest = store.get("encryptedDump");

      getRequest.onsuccess = () => {
        console.log("Dump retrieved from store:", getRequest.result);
        db.close();
        resolve(getRequest.result?.value || null);
      };

      getRequest.onerror = (e) => {
        console.error("Error retrieving dump:", e);
        db.close();
        reject(e);
      };
    });
  }

  /**
   * Clears all data from IndexedDB.
   */
  static async clearStorage(): Promise<void> {
    console.log("Deleting database...");
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = () => {
        console.log("Database deleted successfully.");
        resolve();
      };

      deleteRequest.onerror = (e) => {
        console.error("Error deleting database:", e);
        reject(e);
      };

      deleteRequest.onblocked = () => {
        console.warn("Delete database request is blocked.");
      };
    });
  }
}
