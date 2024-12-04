export declare class EncryptionManager {
    private key;
    /**
     * Generates a new AES-GCM key for encryption and decryption.
     */
    generateKey(): Promise<void>;
    /**
     * Imports an existing raw AES key.
     * @param rawKey - The raw key as a Uint8Array.
     */
    importKey(rawKey: Uint8Array): Promise<void>;
    /**
     * Exports the current AES key as a raw Uint8Array.
     */
    exportKey(): Promise<Uint8Array>;
    /**
     * Encrypts the given data using AES-GCM with a generated IV.
     * @param data - The data to encrypt as a Uint8Array.
     * @returns An object containing the IV and the encrypted data.
     */
    encrypt(data: Uint8Array): Promise<{
        iv: Uint8Array;
        encrypted: Uint8Array;
    }>;
    /**
     * Decrypts the given encrypted data using AES-GCM and the provided IV.
     * @param data - An object containing the IV and the encrypted data.
     * @returns The decrypted data as a Uint8Array.
     */
    decrypt(data: {
        iv: Uint8Array;
        encrypted: Uint8Array;
    }): Promise<Uint8Array>;
}
