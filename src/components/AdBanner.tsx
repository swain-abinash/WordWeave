import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {adService} from '../services/adService';
import {useStyles} from '../state/ThemeContext';
import {Palette} from '../theme';

interface Props {
  placement?: 'bottom' | 'inline';
}

export default function AdBanner({placement = 'bottom'}: Props) {
  const styles = useStyles(makeStyles);
  const [failed, setFailed] = useState(false);
  const [config, setConfig] = useState(adService.getConfig());

  useEffect(() => {
    const unsubscribe = adService.addListener(() => {
      setConfig(adService.getConfig());
      setFailed(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (failed) {
      const retryTimer = setTimeout(() => {
        setFailed(false);
      }, 20000);
      return () => clearTimeout(retryTimer);
    }
  }, [failed]);

  if (failed) {
    return null;
  }

  return (
    <View style={[styles.container, styles[placement]]}>
      <BannerAd
        unitId={config.bannerId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setFailed(false);
        }}
        onAdFailedToLoad={error => {
          console.warn('[AdBanner] Failed to load:', error);
          setFailed(true);
        }}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bg,
      width: '100%',
    },
    bottom: {
      marginTop: 'auto',
    },
    inline: {
      marginVertical: 8,
    },
  });
