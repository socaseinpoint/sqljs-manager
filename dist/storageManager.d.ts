export declare class StorageManager {
    private static dbName;
    private static storeName;
    private static dbVersion;
    /**
     * Ensures the database and object store are properly initialized.
     */
    private static initialize;
    /**
     * Saves an encrypted dump to IndexedDB.
     */
    static saveEncryptedDump(dump: {
        iv: Uint8Array;
        encrypted: Uint8Array;
        salt: Uint8Array;
    }): Promise<void>;
    /**
     * Loads an encrypted dump from IndexedDB.
     */
    static loadEncryptedDump(): Promise<{
        iv: Uint8Array;
        encrypted: Uint8Array;
        salt: Uint8Array;
    } | null>;
    /**
     * Clears all data from IndexedDB.
     */
    static clearStorage(): Promise<void>;
}
