import { exportDump, importDump } from "./dumpHandler";
import { isEncryptedDump } from "./dumpHandler";

export async function uploadDatabaseToServer(
  dbManager: any,
  serverUrl: string
): Promise<void> {
  const dump = await exportDump(dbManager);

  let body: BodyInit;

  if (isEncryptedDump(dump)) {
    // Serialize encrypted dump as JSON
    body = JSON.stringify({
      iv: Array.from(dump.iv), // Convert Uint8Array to array for JSON
      encrypted: Array.from(dump.encrypted), // Convert Uint8Array to array
    });
  } else {
    // Send plain Uint8Array as-is
    body = dump;
  }

  await fetch(`${serverUrl}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": isEncryptedDump(dump) ? "application/json" : "application/octet-stream",
    },
    body,
  });
}

export async function downloadDatabaseFromServer(
  dbManager: any,
  serverUrl: string
): Promise<void> {
  const response = await fetch(`${serverUrl}/download`);
  const dump = await response.arrayBuffer();
  await importDump(dbManager, new Uint8Array(dump));
}
