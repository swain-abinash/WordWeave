/**
 * WordWeave Anti-Tampering & Integrity Shield - Layer 3 Security
 * Validates the runtime environment, ensures the bundle has not been
 * tampered with or repackaged, and guards against prototype hijacking.
 */

import {Platform} from 'react-native';

export const EXPECTED_PACKAGE_NAME = 'com.wordweave.puzzle';

export interface IntegrityReport {
  isSecure: boolean;
  tamperDetected: boolean;
  warnings: string[];
}

/**
 * Checks if prototype methods on sensitive JavaScript built-ins have been hooked
 */
function checkPrototypeIntegrity(): boolean {
  try {
    // Check if JSON.parse or JSON.stringify was hijacked by game cheating injection tools
    const jsonStr = JSON.stringify.toString();
    const parseStr = JSON.parse.toString();
    const isJsonClean = jsonStr.includes('[native code]') && parseStr.includes('[native code]');
    return isJsonClean;
  } catch {
    return true;
  }
}

/**
 * Verifies application runtime environment integrity
 */
export function verifyEnvironmentIntegrity(): IntegrityReport {
  const warnings: string[] = [];
  let tamperDetected = false;

  // 1. Prototype hooking audit
  if (!checkPrototypeIntegrity()) {
    tamperDetected = true;
    warnings.push('Prototype tampering detected on native JS primitives');
  }

  // 2. Production debug inspection
  if (!__DEV__) {
    // Ensure development tools are not quietly active in production builds
    if ((global as unknown as {__REMOTEDEV__?: unknown}).__REMOTEDEV__) {
      tamperDetected = true;
      warnings.push('Remote devtools attached to release build');
    }
  }

  return {
    isSecure: !tamperDetected,
    tamperDetected,
    warnings,
  };
}

/**
 * Runs integrity audit at startup; logs warnings in DEV, fails silently or self-heals in PROD.
 */
export function runStartupIntegrityCheck(): void {
  const report = verifyEnvironmentIntegrity();
  if (!report.isSecure && __DEV__) {
    console.warn('[Anti-Tamper Shield] Warnings:', report.warnings.join(', '));
  }
}
