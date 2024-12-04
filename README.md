
# **Database Manager with Encryption**

This package provides a simple and efficient solution for managing SQLite databases in the browser, with optional encryption for secure storage and support for exporting, importing, and uploading databases to a server.

---

## **Installation**

Install the package using npm or yarn:

```bash
npm install your-database-package-name
```

or

```bash
yarn add your-database-package-name
```

---

## **Features**

1. **Database Management**:
   - Initialize, export, and import SQLite databases.
   - Execute SQL queries with ease.

2. **Encryption** (Optional):
   - Securely encrypt and decrypt database dumps using AES-GCM.
   - Generate, import, and export encryption keys.

3. **Export and Import**:
   - Export database dumps as plain binary or encrypted data.
   - Import plain or encrypted dumps.

4. **Server Interaction**:
   - Upload database dumps to a server.
   - Easily handle serialized data for server communication.

5. **Local Storage Support**:
   - Save encrypted database dumps to IndexedDB for persistence.
   - Load database dumps from IndexedDB for seamless offline operation.

---

## **Usage**

### **1. Initialize a Database**

```typescript
import { DatabaseManager } from "your-database-package-name";

const dbManager = new DatabaseManager();

// Execute SQL commands
dbManager.execute("CREATE TABLE expenses (id INTEGER PRIMARY KEY, date TEXT, amount REAL)");
dbManager.execute("INSERT INTO expenses (date, amount) VALUES (?, ?)", ["2023-12-03", 100]);

console.log(dbManager.execute("SELECT * FROM expenses"));
```

---

### **2. Enable Encryption**

To enable encryption, initialize an `EncryptionManager`:

```typescript
import { EncryptionManager } from "your-database-package-name";

const encryptionManager = new EncryptionManager();
await encryptionManager.generateKey(); // Generate a new encryption key

// Optionally, export and import keys
const exportedKey = await encryptionManager.exportKey();
await encryptionManager.importKey(exportedKey);
```

---

### **3. Export and Import Database Dumps**

#### Exporting a Database
You can export the database as plain or encrypted data:

```typescript
import { exportDump } from "your-database-package-name";

const dump = await exportDump(dbManager, encryptionManager); // Encrypted
// Or export without encryption
const plainDump = await exportDump(dbManager);
```

#### Importing a Database
Import previously exported dumps (plain or encrypted):

```typescript
import { importDump } from "your-database-package-name";

await importDump(dbManager, dump, encryptionManager); // Import encrypted dump
await importDump(dbManager, plainDump); // Import plain dump
```

---

### **4. Save and Load Database to/from IndexedDB**

#### Save Encrypted Database to IndexedDB
```typescript
await dbManager.saveToLocalStorage(); // Saves the encrypted database dump to IndexedDB
```

#### Load Encrypted Database from IndexedDB
```typescript
await dbManager.loadFromLocalStorage("secure-password"); // Loads the encrypted dump
```

---

### **5. Upload Database to Server**

Upload a database dump to a server endpoint:

```typescript
import { uploadDatabaseToServer } from "your-database-package-name";

await uploadDatabaseToServer(dbManager, "https://your-server.com");
```

---

### **6. Server Integration Example**

On the server, handle both plain and encrypted database dumps. Example using Node.js with Express:

```javascript
const express = require("express");
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

app.post("/upload", (req, res) => {
  if (req.is("application/octet-stream")) {
    console.log("Received plain binary dump:", req.body);
  } else if (req.is("application/json")) {
    const { iv, encrypted } = req.body;
    console.log("Received encrypted dump:", { iv, encrypted });
  } else {
    return res.status(400).send("Unsupported content type");
  }

  res.send("Upload successful");
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## **API Reference**

### **Classes**

#### **`DatabaseManager`**
- `execute(query: string, params?: any[]): any[]`
  - Executes an SQL query with optional parameters.
- `exportDatabase(): Promise<Uint8Array | { iv: Uint8Array; encrypted: Uint8Array }>`
  - Exports the database dump (plain or encrypted).
- `importDatabase(dump: Uint8Array | { iv: Uint8Array; encrypted: Uint8Array }): Promise<void>`
  - Imports a database dump.
- `saveToLocalStorage(): Promise<void>`
  - Saves an encrypted database dump to IndexedDB.
- `loadFromLocalStorage(password: string): Promise<void>`
  - Loads an encrypted database dump from IndexedDB.

#### **`EncryptionManager`**
- `generateKey(): Promise<void>`
  - Generates a new encryption key.
- `exportKey(): Promise<Uint8Array>`
  - Exports the current encryption key.
- `importKey(key: Uint8Array): Promise<void>`
  - Imports an encryption key.
- `encrypt(data: Uint8Array): Promise<{ iv: Uint8Array; encrypted: Uint8Array }>`
  - Encrypts a given `Uint8Array`.
- `decrypt(data: { iv: Uint8Array; encrypted: Uint8Array }): Promise<Uint8Array>`
  - Decrypts encrypted data.

---

### **Functions**

#### **`exportDump`**
Exports the database dump.
```typescript
exportDump(
  dbManager: DatabaseManager,
  encryptionManager?: EncryptionManager
): Promise<Uint8Array | { iv: Uint8Array; encrypted: Uint8Array }>
```

#### **`importDump`**
Imports a previously exported dump.
```typescript
importDump(
  dbManager: DatabaseManager,
  dump: Uint8Array | { iv: Uint8Array; encrypted: Uint8Array },
  encryptionManager?: EncryptionManager
): Promise<void>
```

#### **`uploadDatabaseToServer`**
Uploads the database dump to a server.
```typescript
uploadDatabaseToServer(
  dbManager: DatabaseManager,
  serverUrl: string
): Promise<void>
```

---

## **License**

This package is licensed under the MIT License.

---

## **Contributing**

Contributions are welcome! Please open an issue or submit a pull request on the GitHub repository.
