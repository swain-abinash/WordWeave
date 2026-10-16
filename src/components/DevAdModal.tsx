import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppEnvironment} from '../config/adConfig';
import {adService} from '../services/adService';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius} from '../theme';
import Icon from './Icon';
import {Button} from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DevAdModal({visible, onClose}: Props) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);

  const [env, setEnv] = useState<AppEnvironment>(adService.getEnvironment());
  const [rewardedReady, setRewardedReady] = useState(adService.isRewardedReady());
  const [interstitialReady, setInterstitialReady] = useState(
    adService.isInterstitialReady(),
  );

  useEffect(() => {
    const unsub = adService.addListener(() => {
      setEnv(adService.getEnvironment());
      setRewardedReady(adService.isRewardedReady());
      setInterstitialReady(adService.isInterstitialReady());
    });
    return unsub;
  }, []);

  const handleSelectEnv = async (newEnv: AppEnvironment) => {
    await adService.setEnvironment(newEnv);
    setEnv(newEnv);
  };

  const handleTestRewarded = async () => {
    await adService.showRewardedHintAd(
      () => {
        Alert.alert('Reward Earned!', 'User finished watching the Rewarded Ad.');
      },
      undefined,
      err => {
        Alert.alert('Ad Error', err.message);
      },
    );
  };

  const handleTestInterstitial = async () => {
    const shown = await adService.testShowInterstitial();
    if (!shown) {
      Alert.alert(
        'Ad Loading',
        'Interstitial is still loading from Google servers. Please try again in a few seconds.',
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Icon name="sparkles" size={20} color={c.accent} />
            </View>
            <View>
              <Text style={styles.kicker}>ADS CONFIGURATION</Text>
              <Text style={styles.title}>Environment & Ad Test</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Select Environment:</Text>
          <View style={styles.envSelector}>
            {(['DEV', 'UAT', 'PROD'] as AppEnvironment[]).map(e => {
              const selected = env === e;
              return (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.envTab,
                    selected && {backgroundColor: c.accent},
                  ]}
                  onPress={() => handleSelectEnv(e)}>
                  <Text
                    style={[
                      styles.envTabText,
                      selected && {color: '#fff'},
                    ]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              Current: {adService.getConfig().name}
            </Text>
            <Text style={styles.infoSubtitle}>
              {env === 'PROD'
                ? 'Production AdMob Unit IDs (Live ads)'
                : 'Google Official Sample Test IDs (Safe for testing)'}
            </Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Rewarded Ad:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {color: rewardedReady ? c.success : c.gold},
                ]}>
                {rewardedReady ? '● Ready' : '○ Loading...'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Interstitial Ad:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {color: interstitialReady ? c.success : c.gold},
                ]}>
                {interstitialReady ? '● Ready' : '○ Loading...'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Instant Ad Testing:</Text>
          <View style={styles.testActions}>
            <Button
              title="🎬 Test Rewarded Video Ad"
              onPress={handleTestRewarded}
            />
            <Button
              title="📺 Test Interstitial Ad"
              variant="secondary"
              onPress={handleTestInterstitial}
            />
          </View>

          <View style={styles.closeWrap}>
            <Button title="Close" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: c.bgElevated,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    badge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: `${c.accent}22`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kicker: {
      ...kicker(c),
      color: c.textDim,
    },
    title: {
      color: c.text,
      fontSize: 18,
      fontFamily: fonts.heavy,
    },
    sectionLabel: {
      color: c.textDim,
      fontSize: 12,
      fontFamily: fonts.heavy,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    envSelector: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: radius.md,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    envTab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: radius.sm,
    },
    envTabText: {
      fontFamily: fonts.heavy,
      fontSize: 13,
      color: c.textDim,
    },
    infoBox: {
      backgroundColor: c.card,
      padding: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 20,
    },
    infoTitle: {
      color: c.text,
      fontFamily: fonts.heavy,
      fontSize: 14,
      marginBottom: 2,
    },
    infoSubtitle: {
      color: c.textDim,
      fontFamily: fonts.medium,
      fontSize: 12,
      marginBottom: 10,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    statusLabel: {
      color: c.textDim,
      fontFamily: fonts.semibold,
      fontSize: 12,
    },
    statusValue: {
      fontFamily: fonts.heavy,
      fontSize: 12,
    },
    testActions: {
      gap: 10,
      marginBottom: 10,
    },
    closeWrap: {
      marginTop: 8,
    },
  });
