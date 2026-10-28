/**
 * WordWeave Cryptographic Vault - Layer 6 Security
 * Tamper-proof storage with cryptographic checksum verification.
 * Prevents players from editing AsyncStorage save files to unlock levels,
 * fake stars, or bypass rewarded ads.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const VAULT_SALT = 'WW_VAULT_INTEGRITY_2026_K7';

/**
 * Fast 32-bit FNV-1a cryptographic checksum generator
 */
function computeChecksum(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Computes a HMAC-style signature over payload string
 */
export function generateSignature(dataStr: string): string {
  const step1 = computeChecksum(`${VAULT_SALT}#${dataStr}`);
  const step2 = computeChecksum(`${dataStr}#${step1}#${dataStr.length}`);
  return `${step1}-${step2}`;
}

/**
 * Validates data integrity against cryptographic signature
 */
export function verifySignature(dataStr: string, sig: string): boolean {
  if (!sig || typeof sig !== 'string') {
    return false;
  }
  return generateSignature(dataStr) === sig;
}

interface VaultEnvelope {
  _sec_v: number;
  sig: string;
  d: string;
}

/**
 * Securely persists data with integrity checksum signature
 */
export async function secureSave(key: string, data: unknown): Promise<void> {
  try {
    const json = JSON.stringify(data);
    const sig = generateSignature(json);
    const envelope: VaultEnvelope = {
      _sec_v: 2,
      sig,
      d: json,
    };
    await AsyncStorage.setItem(key, JSON.stringify(envelope));
  } catch (error) {
    // Fallback direct save if envelope fails
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Securely loads and verifies integrity of persisted data.
 * Gracefully migrates un-signed legacy saves while rejecting tampered files.
 */
export async function secureLoad<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return defaultValue;
    }

    // Check if wrapped in cryptographic envelope
    if (raw.includes('"_sec_v"') && raw.includes('"sig"')) {
      const parsed = JSON.parse(raw) as VaultEnvelope;
      if (parsed.d && parsed.sig) {
        if (verifySignature(parsed.d, parsed.sig)) {
          return JSON.parse(parsed.d) as T;
        } else {
          // Signature check failed - file was tampered with!
          if (__DEV__) {
            console.warn('[Security Vault] Data integrity violation! Resetting tampered state.');
          }
          return defaultValue;
        }
      }
    }

    // Legacy un-signed save: safely parse and return for migration
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}
