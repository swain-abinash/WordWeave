import {TestIds} from 'react-native-google-mobile-ads';

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
    appId: 'ca-app-pub-3940256099942544~3347511713',
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
    appId: 'ca-app-pub-3940256099942544~3347511713',
    bannerId: TestIds.BANNER,
    interstitialId: TestIds.INTERSTITIAL,
    rewardedId: TestIds.REWARDED,
    interstitialInterval: 3,
    freeHintsPerLevel: 2,
    debugLogs: true,
    tag: 'UAT',
    allowSimulatedRewardOnFailure: false,
  },
  PROD: {
    env: 'PROD',
    name: 'Production',
    // Replace with your real AdMob unit IDs when your AdMob account is active
    appId: 'ca-app-pub-3940256099942544~3347511713', // Replace with real production App ID
    bannerId: 'ca-app-pub-3940256099942544/6300978111', // Replace with real Banner Ad Unit ID
    interstitialId: 'ca-app-pub-3940256099942544/1033173712', // Replace with real Interstitial Ad Unit ID
    rewardedId: 'ca-app-pub-3940256099942544/5224354917', // Replace with real Rewarded Ad Unit ID
    interstitialInterval: 3,
    freeHintsPerLevel: 2,
    debugLogs: false,
    tag: '',
    allowSimulatedRewardOnFailure: false,
  },
};

/** Default environment to start with */
export const DEFAULT_ENV: AppEnvironment = 'DEV';
