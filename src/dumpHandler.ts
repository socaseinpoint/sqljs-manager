import { DatabaseManager } from "./databaseManager";
import { EncryptionManager } from "./encryption";

export async function exportDump(
  dbManager: DatabaseManager,
  encryptionManager?: EncryptionManager
): Promise<{ iv: Uint8Array; encrypted: Uint8Array } | Uint8Array> {
  const dump = await dbManager.exportDatabase();

  if (encryptionManager) {
    const { iv, encrypted } = await encryptionManager.encrypt(dump as Uint8Array);
    return { iv, encrypted };
  }

  return dump as Uint8Array;
}

export function isEncryptedDump(
  dump: Uint8Array | { iv: Uint8Array; encryptedDump: Uint8Array }
): dump is { iv: Uint8Array; encryptedDump: Uint8Array } {
  return typeof dump === "object" && "iv" in dump && "encryptedDump" in dump;
}

export async function importDump(
  dbManager: DatabaseManager,
  dump: Uint8Array | { iv: Uint8Array; encryptedDump: Uint8Array },
  encryptionManager?: EncryptionManager
): Promise<void> {
  let decryptedDump: Uint8Array;

  if (encryptionManager && isEncryptedDump(dump)) {
    decryptedDump = await encryptionManager.decrypt({
      iv: dump.iv,
      encrypted: dump.encryptedDump, // Use `encryptedDump` here
    });
  } else {
    decryptedDump = dump as Uint8Array;
  }

  await dbManager.importDatabase(decryptedDump);
}

