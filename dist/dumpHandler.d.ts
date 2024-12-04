import { DatabaseManager } from './databaseManager';
import { EncryptionManager } from './encryption';
export declare function exportDump(dbManager: DatabaseManager, encryptionManager?: EncryptionManager): Promise<{
    iv: Uint8Array;
    encrypted: Uint8Array;
} | Uint8Array>;
export declare function isEncryptedDump(dump: Uint8Array | {
    iv: Uint8Array;
    encryptedDump: Uint8Array;
}): dump is {
    iv: Uint8Array;
    encryptedDump: Uint8Array;
};
export declare function importDump(dbManager: DatabaseManager, dump: Uint8Array | {
    iv: Uint8Array;
    encryptedDump: Uint8Array;
}, encryptionManager?: EncryptionManager): Promise<void>;
