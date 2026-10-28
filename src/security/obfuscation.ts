/**
 * WordWeave Revenue Shield - Layer 2 Security
 * Obfuscates sensitive AdMob Publisher & Ad Unit IDs to prevent
 * reverse-engineering, APK scraping, rogue cloning, and invalid traffic sabotage.
 */

const XOR_KEY = 'WW_SEC_SHIELD_2026_X9';

/**
 * Decodes a hex-encoded XOR-masked string in memory at runtime.
 */
export function deobfuscate(hex: string, key: string = XOR_KEY): string {
  let res = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substring(i, i + 2), 16);
    res += String.fromCharCode(code ^ key.charCodeAt((i / 2) % key.length));
  }
  return res;
}

/**
 * Obfuscated Production Ad Unit Hashes (Layer 2 Shield)
 * Plaintext IDs do not exist in the source or compiled bytecode.
 */
export const OBFUSCATED_PROD_ADS = {
  APP_ID: '34367232353372233d2b6878736b0204070e686c0f66606a64757521627f78777a756d0a010b',
  BANNER: '34367232353372233d2b6878736b0204070e686c0f66606a647575706b717a74747c6d060202',
  INTERSTITIAL: '34367232353372233d2b6878736b0204070e686c0f66606a64757570657e7e72757d66020306',
  REWARDED: '34367232353372233d2b6878736b0204070e686c0f66606a64757570647d71737c746d020000',
};

/**
 * Resolves the Ad ID safely at runtime
 */
export function getSecureAdId(type: 'APP_ID' | 'BANNER' | 'INTERSTITIAL' | 'REWARDED'): string {
  return deobfuscate(OBFUSCATED_PROD_ADS[type]);
}
