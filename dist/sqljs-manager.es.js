import p from "sql.js";
class d {
  constructor() {
    this.key = null;
  }
  /**
   * Generates a new AES-GCM key for encryption and decryption.
   */
  async generateKey() {
    this.key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      !0,
      ["encrypt", "decrypt"]
    );
  }
  /**
   * Imports an existing raw AES key.
   * @param rawKey - The raw key as a Uint8Array.
   */
  async importKey(e) {
    this.key = await crypto.subtle.importKey(
      "raw",
      e,
      { name: "AES-GCM" },
      !0,
      ["encrypt", "decrypt"]
    );
  }
  /**
   * Exports the current AES key as a raw Uint8Array.
   */
  async exportKey() {
    if (!this.key)
      throw new Error("Encryption key not initialized. Call generateKey() or importKey() first.");
    return new Uint8Array(await crypto.subtle.exportKey("raw", this.key));
  }
  /**
   * Encrypts the given data using AES-GCM with a generated IV.
   * @param data - The data to encrypt as a Uint8Array.
   * @returns An object containing the IV and the encrypted data.
   */
  async encrypt(e) {
    if (!this.key)
      throw new Error("Encryption key not initialized. Call generateKey() or importKey() first.");
    const t = crypto.getRandomValues(new Uint8Array(12)), r = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv: t }, this.key, e)
    );
    return { iv: t, encrypted: r };
  }
  /**
   * Decrypts the given encrypted data using AES-GCM and the provided IV.
   * @param data - An object containing the IV and the encrypted data.
   * @returns The decrypted data as a Uint8Array.
   */
  async decrypt(e) {
    if (!this.key)
      throw new Error("Encryption key not initialized. Call generateKey() or importKey() first.");
    try {
      return new Uint8Array(
        await crypto.subtle.decrypt({ name: "AES-GCM", iv: e.iv }, this.key, e.encrypted)
      );
    } catch {
      throw new Error("Decryption failed. Ensure the IV and key are correct.");
    }
  }
}
class h {
  constructor(e = !1) {
    this.db = null, this.encryptionManager = e ? new d() : null;
  }
  async initialize(e) {
    const t = await p({ locateFile: () => "/sql-wasm.wasm" });
    this.db = new t.Database(), this.encryptionManager && await this.encryptionManager.generateKey(), e.forEach((r) => this.db.run(r));
  }
  execute(e, t = []) {
    if (!this.db)
      throw new Error("Database not initialized.");
    return this.db.exec(e, t);
  }
  async exportDatabase() {
    const e = this.db.export();
    if (this.encryptionManager) {
      const { iv: t, encrypted: r } = await this.encryptionManager.encrypt(e);
      return { iv: t, encrypted: r };
    }
    return e;
  }
  async importDatabase(e) {
    let t = e;
    this.encryptionManager && "iv" in e && "encrypted" in e && (t = await this.encryptionManager.decrypt(e));
    const r = await p({ locateFile: () => "/sql-wasm.wasm" });
    this.db = new r.Database(t);
  }
}
async function b(n, e) {
  var r;
  const t = ((r = n.execute(`
    SELECT MAX(version) as version FROM schema_version
  `)[0]) == null ? void 0 : r.values[0][0]) || 0;
  for (const a of e)
    a.version > t && (a.queries.forEach((i) => n.execute(i)), n.execute(
      "INSERT INTO schema_version (version) VALUES (?)",
      [a.version]
    ));
}
async function u(n, e) {
  const t = await n.exportDatabase();
  if (e) {
    const { iv: r, encrypted: a } = await e.encrypt(t);
    return { iv: r, encrypted: a };
  }
  return t;
}
function c(n) {
  return typeof n == "object" && "iv" in n && "encryptedDump" in n;
}
async function m(n, e, t) {
  let r;
  t && c(e) ? r = await t.decrypt({
    iv: e.iv,
    encrypted: e.encryptedDump
    // Use `encryptedDump` here
  }) : r = e, await n.importDatabase(r);
}
async function g(n, e) {
  const t = await u(n);
  let r;
  c(t) ? r = JSON.stringify({
    iv: Array.from(t.iv),
    // Convert Uint8Array to array for JSON
    encrypted: Array.from(t.encrypted)
    // Convert Uint8Array to array
  }) : r = t, await fetch(`${e}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": c(t) ? "application/json" : "application/octet-stream"
    },
    body: r
  });
}
async function f(n, e) {
  const r = await (await fetch(`${e}/download`)).arrayBuffer();
  await m(n, new Uint8Array(r));
}
class y {
  /**
   * Ensures the database and object store are properly initialized.
   */
  static async initialize() {
    return new Promise((e, t) => {
      console.log("Initializing IndexedDB...");
      const r = indexedDB.open(this.dbName, this.dbVersion);
      r.onupgradeneeded = () => {
        console.log("Upgrade needed. Creating or verifying object store...");
        const a = r.result;
        a.objectStoreNames.contains(this.storeName) || a.createObjectStore(this.storeName, { keyPath: "key" });
      }, r.onsuccess = () => {
        console.log("Database initialized successfully."), e(r.result);
      }, r.onerror = (a) => {
        console.error("Error initializing database:", a), t(a);
      };
    });
  }
  /**
   * Saves an encrypted dump to IndexedDB.
   */
  static async saveEncryptedDump(e) {
    console.log("Saving with key: 'encryptedDump'");
    const t = await this.initialize();
    return new Promise((r, a) => {
      const o = t.transaction(this.storeName, "readwrite").objectStore(this.storeName).put({ key: "encryptedDump", value: e });
      o.onsuccess = () => {
        console.log("Dump saved successfully."), t.close(), r();
      }, o.onerror = (l) => {
        console.error("Error saving dump:", l), t.close(), a(l);
      };
    });
  }
  /**
   * Loads an encrypted dump from IndexedDB.
   */
  static async loadEncryptedDump() {
    console.log("Loading with key: 'encryptedDump'");
    const e = await this.initialize();
    return new Promise((t, r) => {
      const s = e.transaction(this.storeName, "readonly").objectStore(this.storeName).get("encryptedDump");
      s.onsuccess = () => {
        var o;
        console.log("Dump retrieved from store:", s.result), e.close(), t(((o = s.result) == null ? void 0 : o.value) || null);
      }, s.onerror = (o) => {
        console.error("Error retrieving dump:", o), e.close(), r(o);
      };
    });
  }
  /**
   * Clears all data from IndexedDB.
   */
  static async clearStorage() {
    return console.log("Deleting database..."), new Promise((e, t) => {
      const r = indexedDB.deleteDatabase(this.dbName);
      r.onsuccess = () => {
        console.log("Database deleted successfully."), e();
      }, r.onerror = (a) => {
        console.error("Error deleting database:", a), t(a);
      }, r.onblocked = () => {
        console.warn("Delete database request is blocked.");
      };
    });
  }
}
y.dbName = "secured-db";
y.storeName = "dumps";
y.dbVersion = 1;
export {
  h as DatabaseManager,
  d as EncryptionManager,
  y as StorageManager,
  b as applyMigrations,
  f as downloadDatabaseFromServer,
  u as exportDump,
  m as importDump,
  g as uploadDatabaseToServer
};
