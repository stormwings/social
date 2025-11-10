/**
 * Validates that required fields are present in the request
 * @param data - Request data to validate
 * @param requiredFields - Array of required field names
 * @returns True if all required fields are present and valid
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): boolean {
  return requiredFields.every((field) => {
    const value = data[field];
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Validates that a value is a positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && value > 0;
}

/**
 * Validates Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates that environment variable is set
 */
export function validateEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}
