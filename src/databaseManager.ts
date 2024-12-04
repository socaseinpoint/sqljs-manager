import initSqlJs from "sql.js";
import { EncryptionManager } from "./encryption";

export class DatabaseManager {
  private db: any;
  protected encryptionManager: EncryptionManager | null;

  constructor(useEncryption = false) {
    this.db = null;
    this.encryptionManager = useEncryption ? new EncryptionManager() : null;
  }

  async initialize(schema: string[]): Promise<void> {
    const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
    this.db = new SQL.Database();

    if (this.encryptionManager) {
      await this.encryptionManager.generateKey();
    }

    schema.forEach((query) => this.db.run(query));
  }

  execute(query: string, params: any[] = []): any {
    if (!this.db) throw new Error("Database not initialized.");
    return this.db.exec(query, params);
  }

  async exportDatabase(): Promise<Uint8Array | { iv: Uint8Array; encrypted: Uint8Array }> {
    const dump = this.db.export();
  
    if (this.encryptionManager) {
      const { iv, encrypted } = await this.encryptionManager.encrypt(dump);
      return { iv, encrypted }; // Use consistent property name
    }
  
    return dump; // Return plain dump if no encryption
  }
  

  async importDatabase(dump: Uint8Array | { iv: Uint8Array; encrypted: Uint8Array }): Promise<void> {
    let decryptedDump = dump;

    if (this.encryptionManager && "iv" in dump && "encrypted" in dump) {
      decryptedDump = await this.encryptionManager.decrypt(dump as {
        iv: Uint8Array;
        encrypted: Uint8Array;
      });
    }

    const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
    this.db = new SQL.Database(decryptedDump as Uint8Array);
  }
}
