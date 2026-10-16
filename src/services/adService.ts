import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds, {
  AdEventType,
  InterstitialAd,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import {
  AD_CONFIGS,
  AdEnvironmentConfig,
  AppEnvironment,
  DEFAULT_ENV,
} from '../config/adConfig';

const ENV_STORAGE_KEY = '@wordweave_active_env';

class AdService {
  private currentEnv: AppEnvironment = DEFAULT_ENV;
  private config: AdEnvironmentConfig = AD_CONFIGS[DEFAULT_ENV];
  private isInitialized = false;

  private interstitialAd: InterstitialAd | null = null;
  private isInterstitialLoaded = false;
  private isInterstitialLoading = false;

  private rewardedAd: RewardedAd | null = null;
  private isRewardedLoaded = false;
  private isRewardedLoading = false;

  private listeners: Set<() => void> = new Set();

  private log(message: string, ...args: unknown[]) {
    if (this.config.debugLogs) {
      console.log(`[AdService:${this.currentEnv}] ${message}`, ...args);
    }
  }

  /** Initialize the AdMob SDK and restore saved environment */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const savedEnv = (await AsyncStorage.getItem(
        ENV_STORAGE_KEY,
      )) as AppEnvironment | null;
      if (savedEnv && AD_CONFIGS[savedEnv]) {
        this.currentEnv = savedEnv;
        this.config = AD_CONFIGS[savedEnv];
      }
    } catch {
      // Use default environment if storage read fails
    }

    try {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      const adapterStatuses = await mobileAds().initialize();
      this.isInitialized = true;
      this.log('Google Mobile Ads initialized successfully', adapterStatuses);

      // Preload initial ads
      this.loadInterstitial();
      this.loadRewarded();
    } catch (error) {
      this.log('Failed to initialize Google Mobile Ads SDK:', error);
    }
  }

  /** Get active environment and config */
  public getEnvironment(): AppEnvironment {
    return this.currentEnv;
  }

  public getConfig(): AdEnvironmentConfig {
    return this.config;
  }

  /** Switch environment between DEV, UAT, and PROD */
  public async setEnvironment(newEnv: AppEnvironment): Promise<void> {
    if (this.currentEnv === newEnv) {
      return;
    }
    this.currentEnv = newEnv;
    this.config = AD_CONFIGS[newEnv];
    this.log(`Environment switched to ${newEnv}`);

    try {
      await AsyncStorage.setItem(ENV_STORAGE_KEY, newEnv);
    } catch {
      // Ignore storage write error
    }

    // Reload ads with new environment unit IDs
    this.isInterstitialLoaded = false;
    this.isRewardedLoaded = false;
    this.loadInterstitial();
    this.loadRewarded();
    this.notifyListeners();
  }

  /** Subscribe to ad status updates */
  public addListener(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch {
        // Ignore listener error
      }
    });
  }

  // ==========================================
  // Interstitial Ads
  // ==========================================

  public isInterstitialReady(): boolean {
    return this.isInterstitialLoaded;
  }

  public loadInterstitial(): void {
    if (this.isInterstitialLoading) {
      return;
    }
    this.isInterstitialLoading = true;
    this.log('Preloading Interstitial Ad with ID:', this.config.interstitialId);

    try {
      const ad = InterstitialAd.createForAdRequest(
        this.config.interstitialId,
        {
          requestNonPersonalizedAdsOnly: true,
        },
      );

      const unsubscribeLoaded = ad.addAdEventListener(
        AdEventType.LOADED,
        () => {
          this.log('Interstitial Ad loaded and ready to display');
          this.isInterstitialLoaded = true;
          this.isInterstitialLoading = false;
          this.notifyListeners();
        },
      );

      const unsubscribeClosed = ad.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          this.log('Interstitial Ad closed by user');
          this.isInterstitialLoaded = false;
          this.interstitialAd = null;
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
          this.notifyListeners();
          // Immediately preload next interstitial for upcoming levels
          this.loadInterstitial();
        },
      );

      const unsubscribeError = ad.addAdEventListener(
        AdEventType.ERROR,
        error => {
          this.log('Interstitial Ad failed to load:', error);
          this.isInterstitialLoaded = false;
          this.isInterstitialLoading = false;
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
          this.notifyListeners();
        },
      );

      this.interstitialAd = ad;
      ad.load();
    } catch (error) {
      this.log('Error creating Interstitial Ad:', error);
      this.isInterstitialLoading = false;
    }
  }

  /**
   * Check if the completed level warrants an interstitial ad based on interval
   * and show it if ready.
   */
  public async showInterstitialIfEligible(levelId: number): Promise<boolean> {
    const isEligible = levelId % this.config.interstitialInterval === 0;
    this.log(
      `Level ${levelId} complete. Interstitial eligible? ${isEligible} (interval: ${this.config.interstitialInterval})`,
    );

    if (!isEligible) {
      return false;
    }

    if (this.interstitialAd && this.isInterstitialLoaded) {
      try {
        await this.interstitialAd.show();
        return true;
      } catch (err) {
        this.log('Failed to show Interstitial Ad:', err);
        this.loadInterstitial();
      }
    } else {
      this.log('Interstitial not loaded yet when requested; reloading');
      this.loadInterstitial();
    }
    return false;
  }

  /** Manually trigger interstitial ad for testing/QA */
  public async testShowInterstitial(): Promise<boolean> {
    if (this.interstitialAd && this.isInterstitialLoaded) {
      try {
        await this.interstitialAd.show();
        return true;
      } catch (err) {
        this.log('Test Interstitial failed to show:', err);
      }
    }
    this.loadInterstitial();
    return false;
  }

  // ==========================================
  // Rewarded Ads (Hints & Power-ups)
  // ==========================================

  public isRewardedReady(): boolean {
    return this.isRewardedLoaded;
  }

  public loadRewarded(): void {
    if (this.isRewardedLoading) {
      return;
    }
    this.isRewardedLoading = true;
    this.log('Preloading Rewarded Ad with ID:', this.config.rewardedId);

    try {
      const ad = RewardedAd.createForAdRequest(this.config.rewardedId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          this.log('Rewarded Ad loaded and ready to display');
          this.isRewardedLoaded = true;
          this.isRewardedLoading = false;
          this.notifyListeners();
        },
      );

      const unsubscribeError = ad.addAdEventListener(
        AdEventType.ERROR,
        error => {
          this.log('Rewarded Ad failed to load:', error);
          this.isRewardedLoaded = false;
          this.isRewardedLoading = false;
          unsubscribeLoaded();
          unsubscribeError();
          this.notifyListeners();
        },
      );

      this.rewardedAd = ad;
      ad.load();
    } catch (error) {
      this.log('Error creating Rewarded Ad:', error);
      this.isRewardedLoading = false;
    }
  }

  /**
   * Present Rewarded Video Ad to player.
   * Calls onRewardEarned when player finishes watching.
   */
  public async showRewardedHintAd(
    onRewardEarned: () => void,
    onClosed?: () => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    if (!this.rewardedAd || !this.isRewardedLoaded) {
      this.log('Rewarded Ad not ready');

      // In DEV mode, if ad server is unreachable, we can grant fallback reward
      if (this.config.allowSimulatedRewardOnFailure) {
        this.log('DEV fallback: granting reward because ad is not ready');
        onRewardEarned();
        this.loadRewarded();
        return;
      }

      onError?.(new Error('Ad is still loading. Please check internet and try again.'));
      this.loadRewarded();
      return;
    }

    let earned = false;
    const ad = this.rewardedAd;

    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        this.log('User earned reward:', reward);
        earned = true;
        onRewardEarned();
      },
    );

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      this.log('Rewarded Ad closed, earned reward:', earned);
      this.isRewardedLoaded = false;
      this.rewardedAd = null;
      unsubscribeEarned();
      unsubscribeClosed();
      this.notifyListeners();
      onClosed?.();
      // Preload next rewarded ad
      this.loadRewarded();
    });

    try {
      await ad.show();
    } catch (showError) {
      this.log('Error displaying Rewarded Ad:', showError);
      unsubscribeEarned();
      unsubscribeClosed();
      this.isRewardedLoaded = false;
      this.loadRewarded();

      if (this.config.allowSimulatedRewardOnFailure) {
        onRewardEarned();
      } else {
        onError?.(showError as Error);
      }
    }
  }
}

export const adService = new AdService();
