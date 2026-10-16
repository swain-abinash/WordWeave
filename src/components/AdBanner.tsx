import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {adService} from '../services/adService';
import {useStyles} from '../state/ThemeContext';
import {fonts, Palette} from '../theme';

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

  if (failed) {
    if (config.env === 'DEV') {
      return (
        <View style={[styles.devPlaceholder, styles[placement]]}>
          <Text style={styles.devText}>[DEV] Banner Ad Placeholder</Text>
        </View>
      );
    }
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
        onAdFailedToLoad={() => {
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
    devPlaceholder: {
      height: 50,
      width: '100%',
      backgroundColor: c.card,
      borderTopWidth: 1,
      borderColor: c.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    devText: {
      fontFamily: fonts.semibold,
      fontSize: 12,
      color: c.textDim,
    },
  });
