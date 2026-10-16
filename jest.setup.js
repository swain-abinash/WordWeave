/* eslint-env jest */
jest.setTimeout(30000);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: jest.fn(() => ({
      initialize: jest.fn().mockResolvedValue({}),
      setRequestConfiguration: jest.fn().mockResolvedValue({}),
    })),
    BannerAd: props => React.createElement(View, props),
    BannerAdSize: {
      BANNER: 'BANNER',
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    TestIds: {
      BANNER: 'test-banner',
      INTERSTITIAL: 'test-interstitial',
      REWARDED: 'test-rewarded',
      APP_OPEN: 'test-app-open',
    },
    AdEventType: {
      LOADED: 'loaded',
      CLOSED: 'closed',
      ERROR: 'error',
    },
    RewardedAdEventType: {
      LOADED: 'loaded',
      EARNED_REWARD: 'earned_reward',
    },
    MaxAdContentRating: {
      G: 'G',
    },
    InterstitialAd: {
      createForAdRequest: jest.fn(() => ({
        addAdEventListener: jest.fn(() => jest.fn()),
        load: jest.fn(),
        show: jest.fn().mockResolvedValue(true),
      })),
    },
    RewardedAd: {
      createForAdRequest: jest.fn(() => ({
        addAdEventListener: jest.fn(() => jest.fn()),
        load: jest.fn(),
        show: jest.fn().mockResolvedValue(true),
      })),
    },
  };
});

