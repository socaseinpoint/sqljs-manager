import p from "sql.js";
class u {
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
class b {
  constructor(e = !1) {
    this.db = null, this.encryptionManager = e ? new u() : null;
  }
  async initialize(e) {
    const t = await p();
    this.db = new t.Database(), this.encryptionManager && await this.encryptionManager.generateKey(), e.forEach((r) => this.db.run(r));
  }
  execute(e, t = []) {
    if (!this.db) throw new Error("Database not initialized.");
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
    const r = await p();
    this.db = new r.Database(t);
  }
}
async function f(n, e) {
  var r;
  const t = ((r = n.execute(`
    SELECT MAX(version) as version FROM schema_version
  `)[0]) == null ? void 0 : r.values[0][0]) || 0;
  for (const s of e)
    s.version > t && (s.queries.forEach((c) => n.execute(c)), n.execute(
      "INSERT INTO schema_version (version) VALUES (?)",
      [s.version]
    ));
}
async function h(n, e) {
  const t = await n.exportDatabase();
  if (e) {
    const { iv: r, encrypted: s } = await e.encrypt(t);
    return { iv: r, encrypted: s };
  }
  return t;
}
function y(n) {
  return typeof n == "object" && "iv" in n && "encryptedDump" in n;
}
async function m(n, e, t) {
  let r;
  t && y(e) ? r = await t.decrypt({
    iv: e.iv,
    encrypted: e.encryptedDump
    // Use `encryptedDump` here
  }) : r = e, await n.importDatabase(r);
}
async function D(n, e) {
  const t = await h(n);
  let r;
  y(t) ? r = JSON.stringify({
    iv: Array.from(t.iv),
    // Convert Uint8Array to array for JSON
    encrypted: Array.from(t.encrypted)
    // Convert Uint8Array to array
  }) : r = t, await fetch(`${e}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": y(t) ? "application/json" : "application/octet-stream"
    },
    body: r
  });
}
async function g(n, e) {
  const r = await (await fetch(`${e}/download`)).arrayBuffer();
  await m(n, new Uint8Array(r));
}
const a = class a {
  /**
   * Ensures the database and object store are properly initialized.
   */
  static async initialize() {
    return new Promise((e, t) => {
      console.log("Initializing IndexedDB...");
      const r = indexedDB.open(this.dbName, this.dbVersion);
      r.onupgradeneeded = () => {
        console.log("Upgrade needed. Creating or verifying object store...");
        const s = r.result;
        s.objectStoreNames.contains(this.storeName) || s.createObjectStore(this.storeName, { keyPath: "key" });
      }, r.onsuccess = () => {
        console.log("Database initialized successfully."), e(r.result);
      }, r.onerror = (s) => {
        console.error("Error initializing database:", s), t(s);
      };
    });
  }
  /**
   * Saves an encrypted dump to IndexedDB.
   */
  static async saveEncryptedDump(e) {
    console.log("Saving with key: 'encryptedDump'");
    const t = await this.initialize();
    return new Promise((r, s) => {
      const o = t.transaction(this.storeName, "readwrite").objectStore(this.storeName).put({ key: "encryptedDump", value: e });
      o.onsuccess = () => {
        console.log("Dump saved successfully."), t.close(), r();
      }, o.onerror = (l) => {
        console.error("Error saving dump:", l), t.close(), s(l);
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
      const i = e.transaction(this.storeName, "readonly").objectStore(this.storeName).get("encryptedDump");
      i.onsuccess = () => {
        var o;
        console.log("Dump retrieved from store:", i.result), e.close(), t(((o = i.result) == null ? void 0 : o.value) || null);
      }, i.onerror = (o) => {
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
      }, r.onerror = (s) => {
        console.error("Error deleting database:", s), t(s);
      }, r.onblocked = () => {
        console.warn("Delete database request is blocked.");
      };
    });
  }
};
a.dbName = "secured-db", a.storeName = "dumps", a.dbVersion = 1;
let d = a;
export {
  b as DatabaseManager,
  u as EncryptionManager,
  d as StorageManager,
  f as applyMigrations,
  g as downloadDatabaseFromServer,
  h as exportDump,
  m as importDump,
  D as uploadDatabaseToServer
};
