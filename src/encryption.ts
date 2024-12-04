export class EncryptionManager {
  private key: CryptoKey | null = null;

  /**
   * Generates a new AES-GCM key for encryption and decryption.
   */
  async generateKey(): Promise<void> {
    this.key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Imports an existing raw AES key.
   * @param rawKey - The raw key as a Uint8Array.
   */
  async importKey(rawKey: Uint8Array): Promise<void> {
    this.key = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Exports the current AES key as a raw Uint8Array.
   */
  async exportKey(): Promise<Uint8Array> {
    if (!this.key) {
      throw new Error("Encryption key not initialized. Call generateKey() or importKey() first.");
    }
    return new Uint8Array(await crypto.subtle.exportKey("raw", this.key));
  }

  /**
   * Encrypts the given data using AES-GCM with a generated IV.
   * @param data - The data to encrypt as a Uint8Array.
   * @returns An object containing the IV and the encrypted data.
   */
  async encrypt(data: Uint8Array): Promise<{ iv: Uint8Array; encrypted: Uint8Array }> {
    if (!this.key) {
      throw new Error("Encryption key not initialized. Call generateKey() or importKey() first.");
    }
  
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, data)
    );
  
    return { iv, encrypted }; // Use `encrypted` consistently
  }  

  /**
   * Decrypts the given encrypted data using AES-GCM and the provided IV.
   * @param data - An object containing the IV and the encrypted data.
   * @returns The decrypted data as a Uint8Array.
   */
  async decrypt(data: { iv: Uint8Array; encrypted: Uint8Array }): Promise<Uint8Array> {
    if (!this.key) {
      throw new Error("Encryption key not initialized. Call generateKey() or importKey() first.");
    }

    try {
      return new Uint8Array(
        await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.iv }, this.key, data.encrypted)
      );
    } catch (error) {
      throw new Error("Decryption failed. Ensure the IV and key are correct.");
    }
  }
}
