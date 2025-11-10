import crypto from 'crypto';

/**
 * Decrypts a private key that was encrypted using AES-256-GCM
 * @param encryptedData - The encrypted data in format "iv:authTag:encryptedText"
 * @param encryptionKey - The encryption key as a hex string
 * @returns The decrypted private key
 * @throws Error if decryption fails
 */
export function decryptPrivateKey(
  encryptedData: string,
  encryptionKey: string
): string {
  const [iv, authTag, encryptedText] = encryptedData.split(':');

  if (!iv || !authTag || !encryptedText) {
    throw new Error('Invalid encrypted data format');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  try {
    return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt private key');
  }
}

/**
 * Encrypts a private key using AES-256-GCM
 * @param privateKey - The private key to encrypt
 * @param encryptionKey - The encryption key as a hex string
 * @returns The encrypted data in format "iv:authTag:encryptedText"
 */
export function encryptPrivateKey(
  privateKey: string,
  encryptionKey: string
): string {
  // Generate a random initialization vector (IV) for each encryption
  const iv = crypto.randomBytes(12);

  // Create AES-GCM cipher
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  // Encrypt the private key
  let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
  encryptedPrivateKey += cipher.final('hex');

  // Concatenate IV and the authentication tag to the encrypted private key
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encryptedPrivateKey}`;
}
