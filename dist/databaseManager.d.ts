import { EncryptionManager } from "./encryption";
export declare class DatabaseManager {
    private db;
    protected encryptionManager: EncryptionManager | null;
    constructor(useEncryption?: boolean);
    initialize(schema: string[]): Promise<void>;
    execute(query: string, params?: any[]): any;
    exportDatabase(): Promise<Uint8Array | {
        iv: Uint8Array;
        encrypted: Uint8Array;
    }>;
    importDatabase(dump: Uint8Array | {
        iv: Uint8Array;
        encrypted: Uint8Array;
    }): Promise<void>;
}
