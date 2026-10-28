import {deobfuscate, getSecureAdId, OBFUSCATED_PROD_ADS} from '../src/security/obfuscation';
import {generateSignature, verifySignature} from '../src/security/secureStorage';
import {validateLevelCompletion, validateRewardClaim} from '../src/security/antiCheat';
import {verifyEnvironmentIntegrity} from '../src/security/antiTamper';

describe('Security Layer 2: Revenue Shield (AdMob Obfuscation)', () => {
  test('deobfuscates production ad unit IDs correctly in memory', () => {
    const banner = getSecureAdId('BANNER');
    const interstitial = getSecureAdId('INTERSTITIAL');
    const rewarded = getSecureAdId('REWARDED');
    const appId = getSecureAdId('APP_ID');

    expect(banner).toBe('ca-app-pub-4740458746175706/8931882420');
    expect(interstitial).toBe('ca-app-pub-4740458746175706/6677999034');
    expect(rewarded).toBe('ca-app-pub-4740458746175706/7586002002');
    expect(appId).toBe('ca-app-pub-4740458746175706~1712612819');
  });

  test('obfuscated hashes do not contain plaintext ad prefixes', () => {
    for (const val of Object.values(OBFUSCATED_PROD_ADS)) {
      expect(val).not.toContain('ca-app-pub');
      expect(val).not.toContain('4740458746175706');
    }
  });
});

describe('Security Layer 6: Cryptographic Vault (Integrity Checksums)', () => {
  test('generates matching signatures for untouched data', () => {
    const payload = JSON.stringify({unlocked: 5, stars: {1: 3, 2: 3}});
    const sig = generateSignature(payload);

    expect(typeof sig).toBe('string');
    expect(verifySignature(payload, sig)).toBe(true);
  });

  test('rejects tampered data modifications', () => {
    const legitimatePayload = JSON.stringify({unlocked: 5, stars: {1: 3, 2: 3}});
    const sig = generateSignature(legitimatePayload);

    const tamperedPayload = JSON.stringify({unlocked: 50, stars: {1: 3, 2: 3}});
    expect(verifySignature(tamperedPayload, sig)).toBe(false);
  });
});

describe('Security Layer 5: Anti-Cheat & Speedhack Validation', () => {
  test('rejects sequence skipping (jumping ahead unreached levels)', () => {
    // Player is on level 2, tries to complete level 10
    const result = validateLevelCompletion(10, 30, 2);
    expect(result.legitimate).toBe(false);
  });

  test('accepts valid progressive level completions', () => {
    const result = validateLevelCompletion(3, 25, 2);
    expect(result.legitimate).toBe(true);
  });

  test('validates reward claim cooldowns', () => {
    const now = Date.now();
    expect(validateRewardClaim(now - 10000, 5)).toBe(true); // 10s ago >= 5s
    expect(validateRewardClaim(now - 1000, 5)).toBe(false); // 1s ago < 5s
  });
});

describe('Security Layer 3: Anti-Tampering & Environment Checks', () => {
  test('environment integrity report generates clean status', () => {
    const report = verifyEnvironmentIntegrity();
    expect(report).toHaveProperty('isSecure');
    expect(report).toHaveProperty('warnings');
    expect(Array.isArray(report.warnings)).toBe(true);
  });
});
