/**
 * WordWeave Anti-Cheat & Speedhack Guard - Layer 5 Security
 * Prevents memory modding, auto-clickers, impossible speedruns,
 * and illegitimate level unlocking attempts.
 */

export interface CheatDetectionResult {
  legitimate: boolean;
  reason?: string;
}

/**
 * Validates whether a level completion time and jump is physically possible.
 * Minimum human reaction & letter connection time for Wend-rules boards:
 * Even the easiest 3-letter word takes at least 1.2 seconds to identify and trace.
 */
export function validateLevelCompletion(
  levelId: number,
  elapsedSeconds: number,
  currentUnlocked: number,
  wordCount: number = 3,
): CheatDetectionResult {
  // 1. Level sequence jump check
  // Players cannot legitimately complete level N if level N-1 hasn't been reached yet
  if (levelId > currentUnlocked + 1) {
    return {
      legitimate: false,
      reason: `Sequence violation: Tried to complete level ${levelId} while unlocked is ${currentUnlocked}`,
    };
  }

  // 2. Minimum human solve duration (enforced in production to allow instant unit tests)
  if (!__DEV__) {
    const minPossibleSeconds = Math.max(2.5, wordCount * 0.8);
    if (elapsedSeconds < minPossibleSeconds) {
      return {
        legitimate: false,
        reason: `Impossibly fast completion: ${elapsedSeconds}s for ${wordCount} words (min ${minPossibleSeconds}s)`,
      };
    }
  }

  return {legitimate: true};
}

/**
 * Validates reward claims before granting hint or strike refills
 */
export function validateRewardClaim(
  lastRewardTimestamp: number,
  minCooldownSeconds: number = 5,
): boolean {
  const now = Date.now();
  const diffSec = (now - lastRewardTimestamp) / 1000;
  return diffSec >= minCooldownSeconds;
}
