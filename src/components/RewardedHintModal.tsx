import React, {useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {adService} from '../services/adService';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius} from '../theme';
import Icon from './Icon';
import {Button} from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onReward: () => void;
}

export default function RewardedHintModal({visible, onClose, onReward}: Props) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleWatchAd = async () => {
    setLoading(true);
    setErrorMessage(null);

    await adService.showRewardedHintAd(
      () => {
        setLoading(false);
        onReward();
        onClose();
      },
      () => {
        setLoading(false);
      },
      error => {
        setLoading(false);
        setErrorMessage(error.message || 'Ad could not be shown. Please try again.');
      },
    );
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
          <View style={styles.iconCircle}>
            <Icon name="hint" size={32} color={c.gold} />
          </View>

          <Text style={styles.kicker}>FREE HINT</Text>
          <Text style={styles.title}>Need a Clue?</Text>
          <Text style={styles.body}>
            Watch a short video to reveal the next letter on your board!
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.actions}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={c.accent} />
                <Text style={styles.loadingText}>Loading ad...</Text>
              </View>
            ) : (
              <Button
                title="Watch Video (Free Hint)"
                icon="sparkles"
                onPress={handleWatchAd}
              />
            )}
            <Button
              title="Keep Playing"
              variant="secondary"
              onPress={onClose}
              disabled={loading}
            />
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
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: c.bgElevated,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 28,
      alignItems: 'center',
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 24,
      backgroundColor: `${c.gold}22`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    kicker: {
      ...kicker(c),
      color: c.textDim,
      marginBottom: 4,
    },
    title: {
      color: c.text,
      fontSize: 24,
      fontFamily: fonts.heavy,
      textAlign: 'center',
      marginBottom: 8,
    },
    body: {
      color: c.textDim,
      fontSize: 14,
      fontFamily: fonts.medium,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    errorBox: {
      backgroundColor: `${c.danger}18`,
      padding: 10,
      borderRadius: radius.sm,
      marginBottom: 16,
      width: '100%',
    },
    errorText: {
      color: c.danger,
      fontSize: 12,
      fontFamily: fonts.semibold,
      textAlign: 'center',
    },
    actions: {
      width: '100%',
      gap: 10,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      gap: 10,
    },
    loadingText: {
      color: c.text,
      fontFamily: fonts.semibold,
      fontSize: 14,
    },
  });
