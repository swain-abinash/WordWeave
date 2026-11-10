import {TestIds} from 'react-native-google-mobile-ads';
import {getSecureAdId} from '../security/obfuscation';

export type AppEnvironment = 'DEV' | 'UAT' | 'PROD';

export interface AdEnvironmentConfig {
  env: AppEnvironment;
  name: string;
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  /** Number of completed levels between full-screen interstitial ads */
  interstitialInterval: number;
  /** Free hints granted before requiring a rewarded video ad */
  freeHintsPerLevel: number;
  /** Whether to log ad lifecycle events to console */
  debugLogs: boolean;
  /** UI badge text, empty for production */
  tag: string;
  /** If true, dev/testing can fallback gracefully when offline */
  allowSimulatedRewardOnFailure: boolean;
}

/**
 * Environments:
 * - DEV: Google official test units, 2-level interstitial interval, dev fallback allowed, verbose logging.
 * - UAT: Google official test units with strict real-ad completion requirement, 3-level interval, QA logging.
 * - PROD: Live AdMob units, 3-level interval, no debug logs, live production ready.
 */
export const AD_CONFIGS: Record<AppEnvironment, AdEnvironmentConfig> = {
  DEV: {
    env: 'DEV',
    name: 'Development',
    appId: 'ca-app-pub-4740458746175706~1712612819',
    bannerId: TestIds.BANNER,
    interstitialId: TestIds.INTERSTITIAL,
    rewardedId: TestIds.REWARDED,
    interstitialInterval: 2,
    freeHintsPerLevel: 2,
    debugLogs: true,
    tag: 'DEV',
    allowSimulatedRewardOnFailure: true,
  },
  UAT: {
    env: 'UAT',
    name: 'User Acceptance Testing',
    appId: 'ca-app-pub-4740458746175706~1712612819',
    bannerId: TestIds.BANNER,
    interstitialId: TestIds.INTERSTITIAL,
    rewardedId: TestIds.REWARDED,
    interstitialInterval: 3,
    freeHintsPerLevel: 0,
    debugLogs: true,
    tag: 'UAT',
    allowSimulatedRewardOnFailure: false,
  },
  PROD: {
    env: 'PROD',
    name: 'Production',
    appId: getSecureAdId('APP_ID'),

    // ==============================================================
    // ❌ REAL IDS (Temporarily commented for 14-Day Closed Testing to prevent AdMob limit)
    // ==============================================================
    // bannerId: getSecureAdId('BANNER'),
    // interstitialId: getSecureAdId('INTERSTITIAL'),
    // rewardedId: getSecureAdId('REWARDED'),

    // ==============================================================
    // ✅ GOOGLE TEST IDS (Active during Closed Testing with 12 testers)
    // ==============================================================
    bannerId: TestIds.BANNER,
    interstitialId: TestIds.INTERSTITIAL,
    rewardedId: TestIds.REWARDED,

    interstitialInterval: 3,
    freeHintsPerLevel: 0,
    debugLogs: false,
    tag: '',
    allowSimulatedRewardOnFailure: false,
  },
};

/**
 * Managed internally in code:
 * - Automatically 'DEV' during development / debug builds (uses safe Google test ads).
 * - Automatically 'PROD' in production release builds (uses live AdMob unit IDs).
 * Can be manually overridden here to 'DEV' | 'UAT' | 'PROD'.
 */
export const ACTIVE_ENV: AppEnvironment = __DEV__ ? 'DEV' : 'PROD';
export const DEFAULT_ENV: AppEnvironment = ACTIVE_ENV;
