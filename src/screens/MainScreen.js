import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import { colors, spacing, borderRadius } from '../theme/theme';
import { SettingsModal } from '../components/SettingsModal';
import { loadSettings, saveSettings } from '../utils/storage';
import { calculateHourlyRate, calculateWorkDayHours, convertCostToTime } from '../utils/calculations';
import { useLanguage } from '../i18n/LanguageContext';

export const MainScreen = () => {
  const { t, setLang } = useLanguage();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const [price, setPrice] = useState('');
  const [uses, setUses] = useState('');
  
  // New fun states
  const [showEquivalents, setShowEquivalents] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [heartbeatSound, setHeartbeatSound] = useState(null);

  // Focus ref pour passer au champ suivant
  const usesInputRef = useRef(null);

  // Ref pour throttler les haptics du slider
  const lastHapticRef = useRef(0);

  // Valeur d'animation pour les résultats
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initializeApp = async () => {
      const savedSettings = await loadSettings();
      if (savedSettings) {
        setSettings(savedSettings);
        if (savedSettings.lang) setLang(savedSettings.lang);
      } else {
        setSettingsModalVisible(true);
      }
      setIsReady(true);
    };
    initializeApp();
  }, [setLang]);

  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      if (heartbeatSound) {
        heartbeatSound.unloadAsync();
      }
    };
  }, [heartbeatSound]);

  const handleSaveSettings = async (newSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    if (newSettings.lang) setLang(newSettings.lang);
    setSettingsModalVisible(false);
  };

  const { timeCost, costPerUse, timePerUse } = useMemo(() => {
    const empty = { days: 0, hours: 0, minutes: 0 };
    if (!settings || !price) {
      return { timeCost: empty, costPerUse: 0, timePerUse: empty };
    }

    const parsedPrice = parseFloat(price);
    const parsedUses = parseInt(uses) || 1;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return { timeCost: empty, costPerUse: 0, timePerUse: empty };
    }

    const hourlyRate = calculateHourlyRate(settings.salary, settings.hours);
    const workDayHours = calculateWorkDayHours(settings.hours);

    const totalTime = convertCostToTime(parsedPrice, hourlyRate, workDayHours);
    const perUseCost = parsedPrice / parsedUses;
    const timeForOneUse = convertCostToTime(perUseCost, hourlyRate, workDayHours);

    return { timeCost: totalTime, costPerUse: perUseCost, timePerUse: timeForOneUse };
  }, [price, uses, settings]);

  // Animation & Heartbeat Sound Effect
  useEffect(() => {
    let hbPlayer = null;
    let volumeInterval = null;

    const manageHeartbeat = async () => {
      if (price && parseFloat(price) > 0) {
        // Trigger Pop Animation
        scaleAnim.setValue(0.95);
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }).start();

        // If it costs more than 1 day of work, start heartbeat
        if (timeCost.days >= 1) {
          if (!heartbeatSound) {
            try {
              const { sound } = await Audio.Sound.createAsync(
                { uri: 'https://actions.google.com/sounds/v1/human_voices/heartbeat.ogg' },
                { shouldPlay: true, isLooping: true, volume: 0.1 }
              );
              hbPlayer = sound;
              setHeartbeatSound(sound);

              let vol = 0.1;
              volumeInterval = setInterval(() => {
                vol += 0.05;
                if (vol >= 1) {
                  vol = 1;
                  clearInterval(volumeInterval);
                }
                sound.setVolumeAsync(vol);
              }, 1000);
            } catch (error) {
              console.log('Error loading heartbeat', error);
            }
          }
        } else {
          // Cost dropped below 1 day, stop heartbeat
          if (heartbeatSound) {
            await heartbeatSound.stopAsync();
            await heartbeatSound.unloadAsync();
            setHeartbeatSound(null);
          }
        }
      } else {
        // Price is empty, hide equivalents and stop sound
        setShowEquivalents(false);
        if (heartbeatSound) {
          await heartbeatSound.stopAsync();
          await heartbeatSound.unloadAsync();
          setHeartbeatSound(null);
        }
      }
    };

    manageHeartbeat();

    return () => {
      if (volumeInterval) clearInterval(volumeInterval);
      if (hbPlayer) hbPlayer.unloadAsync();
    };
  }, [timeCost, price]);

  const handleSliderChange = (value) => {
    const rounded = Math.round(value);
    if (rounded.toString() === uses) return;

    const now = Date.now();
    if (now - lastHapticRef.current > 100) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticRef.current = now;
    }
    setUses(rounded.toString());
  };

  const handleCancelBuy = async () => {
    setShowConfetti(true);
    if (heartbeatSound) {
      await heartbeatSound.stopAsync();
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/kaching.mp3'),
        { shouldPlay: true }
      );
      // Auto unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing kaching', error);
    }

    setTimeout(() => {
      setShowConfetti(false);
      setPrice('');
      setUses('');
      setShowEquivalents(false);
    }, 3500);
  };

  const formatTimeResult = (time) => {
    let result = [];
    if (time.days > 0) result.push(`${time.days} ${time.days > 1 ? t('days') : t('day')}`);
    if (time.hours > 0) result.push(`${time.hours} ${t('hour')}`);
    if (time.minutes > 0) result.push(`${time.minutes} ${t('minute')}`);

    if (result.length === 0) return `0 ${t('minute')}`;
    return result.join(' ');
  };

  if (!isReady) return null;

  const parsedPrice = parseFloat(price) || 0;
  const currencySym = settings?.currency || '€';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>{t('appTitle')}</Text>
            <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.settingsIcon}>
              <Ionicons name="settings-sharp" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('priceLabel')} ({currencySym})</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              placeholder={t('pricePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => usesInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('usesLabel')}</Text>
            <View style={styles.usesInputContainer}>
              <TextInput
                ref={usesInputRef}
                style={styles.usesInput}
                keyboardType="numeric"
                value={uses}
                placeholder="1"
                placeholderTextColor={colors.secondary}
                onChangeText={(val) => {
                  const cleaned = val.replace(/[^0-9]/g, '');
                  setUses(cleaned);
                }}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={1000}
              step={1}
              value={parseInt(uses) || 1}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={colors.secondary}
              maximumTrackTintColor={colors.surface}
              thumbTintColor={colors.secondary}
            />
          </View>

          {parsedPrice > 0 ? (
            <View style={styles.resultsContainer}>
              <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.resultLabel}>{t('resultMainLabel')}</Text>
                <Text style={styles.resultValuePrimary}>{formatTimeResult(timeCost)}</Text>
                <Text style={styles.resultSubtext}>{t('resultMainSubtext')}</Text>
              </Animated.View>

              <View style={styles.row}>
                <View style={[styles.resultCard, styles.halfCard]}>
                  <Text style={styles.resultLabel}>{t('resultCostPerUse')}</Text>
                  <Text style={styles.resultValueSecondary}>{costPerUse.toFixed(2)} {currencySym}</Text>
                </View>
                <View style={[styles.resultCard, styles.halfCard]}>
                  <Text style={styles.resultLabel}>{t('resultTimePerUse')}</Text>
                  <Text style={styles.resultValueSecondary}>{formatTimeResult(timePerUse)}</Text>
                </View>
              </View>

              {/* Nouvelles actions Fun */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBuy}>
                  <Text style={styles.cancelButtonText}>{t('cancelBtn')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.equivalentsToggle} 
                  onPress={() => setShowEquivalents(!showEquivalents)}
                >
                  <Text style={styles.equivalentsToggleText}>
                    {t('buyInsteadBtn')} {showEquivalents ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Affichage conditionnel des Equivalents */}
              {showEquivalents && (
                <View style={styles.equivalentsContainer}>
                  <Text style={styles.equivalentsTitle}>{t('equivalentsTitle')}</Text>
                  
                  <View style={styles.equivalentRow}>
                    <Text style={styles.equivalentIcon}>🍔</Text>
                    <View style={styles.equivalentInfo}>
                      <Text style={styles.equivalentName}>{t('eqBigMac')}</Text>
                      <Text style={styles.equivalentValue}>{Math.floor(parsedPrice / 4.80)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.equivalentRow}>
                    <Text style={styles.equivalentIcon}>🍿</Text>
                    <View style={styles.equivalentInfo}>
                      <Text style={styles.equivalentName}>{t('eqCinema')}</Text>
                      <Text style={styles.equivalentValue}>{Math.floor(parsedPrice / 12)}</Text>
                    </View>
                  </View>

                  <View style={styles.equivalentRow}>
                    <Text style={styles.equivalentIcon}>📺</Text>
                    <View style={styles.equivalentInfo}>
                      <Text style={styles.equivalentName}>{t('eqNetflix')}</Text>
                      <Text style={styles.equivalentValue}>{(parsedPrice / 8.99).toFixed(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.equivalentRow}>
                    <Text style={styles.equivalentIcon}>📈</Text>
                    <View style={styles.equivalentInfo}>
                      <Text style={styles.equivalentName}>{t('eqSP500')}</Text>
                      <Text style={styles.equivalentValue}>~{(parsedPrice * 10.83).toFixed(2)} {currencySym}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>{t('emptyState')}</Text>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Animation de Confettis */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon count={100} origin={{ x: -10, y: 0 }} fallSpeed={2500} fadeOut />
        </View>
      )}

      <SettingsModal
        visible={settingsModalVisible}
        onSave={handleSaveSettings}
        onClose={() => setSettingsModalVisible(false)}
        initialData={settings}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.s,
  },
  appTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsIcon: {
    padding: spacing.s,
  },
  inputSection: {
    marginBottom: spacing.l,
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: borderRadius.l,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.s,
  },
  priceInput: {
    fontSize: 48,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: spacing.s,
  },
  usesInputContainer: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  usesInput: {
    fontSize: 32,
    color: colors.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    minWidth: 100,
    paddingBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  resultsContainer: {
    marginTop: spacing.xs,
  },
  resultCard: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: borderRadius.l,
    marginBottom: spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48%',
    padding: spacing.m,
  },
  resultLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  resultValuePrimary: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 102, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  resultValueSecondary: {
    color: colors.secondary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    marginTop: spacing.l,
    gap: spacing.m,
  },
  cancelButton: {
    backgroundColor: '#00D4FF',
    padding: spacing.l,
    borderRadius: borderRadius.l,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  equivalentsToggle: {
    alignItems: 'center',
    padding: spacing.s,
  },
  equivalentsToggleText: {
    color: colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  equivalentsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: borderRadius.l,
    marginTop: spacing.m,
    marginBottom: spacing.xxl,
  },
  equivalentsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  equivalentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
  },
  equivalentIcon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  equivalentInfo: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equivalentName: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  equivalentValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
  },
});
