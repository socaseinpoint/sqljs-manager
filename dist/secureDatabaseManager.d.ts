import { DatabaseManager } from './databaseManager';
export declare class SecuredDatabaseManager extends DatabaseManager {
    private password;
    constructor();
    /**
     * Sets the user's password and initializes the encryption manager with it.
     * @param password - The user's password.
     */
    setPassword(password: string): Promise<void>;
    private deriveKeyFromPassword;
    exportSecuredDatabase(): Promise<{
        iv: Uint8Array;
        encrypted: Uint8Array;
        salt: Uint8Array;
    }>;
    importSecuredDatabase(dump: {
        iv: Uint8Array;
        encrypted: Uint8Array;
        salt: Uint8Array;
    }): Promise<void>;
    /**
   * Saves the encrypted database to local storage.
   */
    saveToLocalStorage(): Promise<void>;
    /**
     * Loads the encrypted database from local storage.
     * @param password - The password to decrypt the database.
     */
    loadFromLocalStorage(password: string): Promise<void>;
}
