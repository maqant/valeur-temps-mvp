import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, BackHandler, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import ConfettiCannon from 'react-native-confetti-cannon';
import { colors, spacing, borderRadius } from '../theme/theme';
import { SettingsModal } from '../components/SettingsModal';
import { loadSettings, saveSettings } from '../utils/storage';
import { calculateHourlyRate, calculateWorkDayHours, convertCostToTime } from '../utils/calculations';
import { useLanguage } from '../i18n/LanguageContext';
import { InterstitialAd, AdEventType, TestIds, BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePremium } from '../context/PremiumContext';

const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

const CustomFastFade = {
  duration: 150,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

export const MainScreen = () => {
  const { t, setLang } = useLanguage();
  const { isAdFree, isTrialActive, showPaywall } = usePremium();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  const [price, setPrice] = useState('');
  const [uses, setUses] = useState('');
  
  // New fun states
  const [showEquivalents, setShowEquivalents] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCostRevealed, setIsCostRevealed] = useState(false);

  // Audio Players
  const kachingPlayer = useAudioPlayer(require('../../assets/sounds/kaching.mp3'));
  const cheerPlayer = useAudioPlayer(require('../../assets/sounds/cheer.mp3'));
  const heartbeatPlayer = useAudioPlayer(require('../../assets/sounds/heartbeat.mp3'));

  // Ref pour le volume
  const volumeIntervalRef = useRef(null);

  // Focus refs
  const priceInputRef = useRef(null);
  const usesInputRef = useRef(null);

  // Ref pour throttler les haptics du slider
  const lastHapticRef = useRef(0);

  // Valeur d'animation pour les résultats
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAdFree) return;
    
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [isAdFree]);

  const showInterstitialAdMaybe = () => {
    if (isAdFree || !interstitialLoaded) return;
    if (Math.random() < 0.3) {
      interstitial.show();
      setInterstitialLoaded(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
          shouldPlayInBackground: false,
        });
      } catch (e) {
        console.log('Audio init error', e);
      }

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

  // Clean up volume interval
  useEffect(() => {
    return () => {
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isReady && !settingsModalVisible) {
      const timer = setTimeout(() => {
        priceInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReady, settingsModalVisible]);

  const handleSaveSettings = async (newSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    if (newSettings.lang) setLang(newSettings.lang);
    setSettingsModalVisible(false);
  };

  const { timeCost, costPerUse, timePerUse, hourlyRate = 0 } = useMemo(() => {
    const empty = { days: 0, hours: 0, minutes: 0 };
    if (!settings || !price) {
      return { timeCost: empty, costPerUse: 0, timePerUse: empty, hourlyRate: 0 };
    }

    const parsedPrice = parseFloat(price);
    const parsedUses = parseInt(uses) || 1;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return { timeCost: empty, costPerUse: 0, timePerUse: empty, hourlyRate: 0 };
    }

    const hourlyRate = calculateHourlyRate(settings.salary, settings.hours, settings.taxRate || 0);
    const workDayHours = calculateWorkDayHours(settings.hours);

    const totalTime = convertCostToTime(parsedPrice, hourlyRate, workDayHours);
    const perUseCost = parsedPrice / parsedUses;
    const timeForOneUse = convertCostToTime(perUseCost, hourlyRate, workDayHours);

    return { timeCost: totalTime, costPerUse: perUseCost, timePerUse: timeForOneUse, hourlyRate };
  }, [price, uses, settings]);

  // Animation & Heartbeat Sound Effect
  useEffect(() => {
    const manageHeartbeat = () => {
      const currentParsedPrice = parseFloat(price);
      const isShowingResults = currentParsedPrice > 0 && isCostRevealed;

      if (isShowingResults && !isSaved) {
        // Trigger Pop Animation
        scaleAnim.setValue(0.95);
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }).start();

        // Cœur qui bat si ça dépasse 1 jour
        if (timeCost.days >= 1) {
          if (!heartbeatPlayer.playing) {
            heartbeatPlayer.loop = true;
            heartbeatPlayer.volume = 0.4;
            heartbeatPlayer.play();

            let vol = 0.4;
            if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
            volumeIntervalRef.current = setInterval(() => {
              vol += 0.05;
              if (vol >= 1) {
                vol = 1;
                clearInterval(volumeIntervalRef.current);
              }
              heartbeatPlayer.volume = vol;
            }, 1000);
          }
        } else {
          // Redescend sous 1 jour
          if (heartbeatPlayer.playing) {
            heartbeatPlayer.pause();
          }
          if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
        }
      } else {
        // Prix vide ou mode "sauvé"
        setShowEquivalents(false);
        if (heartbeatPlayer.playing) {
          heartbeatPlayer.pause();
        }
        if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      }
    };

    manageHeartbeat();
  }, [timeCost, price, isSaved, heartbeatPlayer, scaleAnim]);

  const playKaching = () => {
    kachingPlayer.volume = 0.8;
    kachingPlayer.play();
  };

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

  const handleCancelBuy = () => {
    setIsSaved(true);
    
    // Décalage des confettis pour éviter le lag graphique pendant le changement de Vue
    setTimeout(() => {
      setShowConfetti(true);
      setConfettiKey(prev => prev + 1);
    }, 150);

    if (heartbeatPlayer.playing) {
      heartbeatPlayer.pause();
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
    }

    // Clameur de la foule
    cheerPlayer.seekTo(0);
    cheerPlayer.volume = 1.0;
    cheerPlayer.play();
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
  const taxAmount = settings ? (settings.salary * ((settings.taxRate || 0) / 100)).toFixed(0) : 0;
  const monthlyHours = settings ? (settings.hours * 4.33).toFixed(1) : 0;

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
          keyboardDismissMode="on-drag"
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>{t('appTitle')}</Text>
            <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.settingsIcon}>
              <Ionicons name="settings-sharp" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isSaved ? (
            <View style={styles.savedStateContainer}>
              <Text style={styles.savedStateTitle}>{t('savedTitle')}</Text>
              <Text style={styles.savedStateText}>{t('savedText')}</Text>
              
              <TouchableOpacity 
                style={styles.quitButton} 
                onPress={() => BackHandler.exitApp()}
              >
                <Text style={styles.quitButtonText}>{t('quitAppBtn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  LayoutAnimation.configureNext(CustomFastFade);
                  setIsSaved(false);
                  setShowConfetti(false);
                  setPrice('');
                  setUses('');
                  setShowEquivalents(false);
                  setShowDetails(false);
                }}
              >
                <Text style={styles.resetButtonText}>{t('resetCalcBtn')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.inputSection}>
                <Text style={styles.label}>{t('priceLabel')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <TextInput
                    ref={priceInputRef}
                    style={styles.priceInput}
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={(val) => {
                      setPrice(val);
                      setIsSaved(false);
                      setShowConfetti(false);
                      setIsCostRevealed(false);
                      setShowDetails(false);
                    }}
                    placeholder={t('pricePlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                    maxLength={10}
                    returnKeyType="next"
                    onSubmitEditing={() => usesInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <Text style={{ fontSize: 48, color: (!price || price === '') ? colors.textSecondary : colors.primary, fontWeight: 'bold', marginLeft: 4 }}>{currencySym}</Text>
                </View>
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
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      if (parsedPrice > 0) {
                        LayoutAnimation.configureNext(CustomFastFade);
                        setIsCostRevealed(true);
                        playKaching();
                        showInterstitialAdMaybe();
                      }
                    }}
                  />
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={1000}
                  step={1}
                  value={parseInt(uses) || 1}
                  onValueChange={handleSliderChange}
                  onSlidingComplete={() => {
                    Keyboard.dismiss();
                    if (parsedPrice > 0) {
                      LayoutAnimation.configureNext(CustomFastFade);
                      setIsCostRevealed(true);
                      playKaching();
                      showInterstitialAdMaybe();
                    }
                  }}
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

                  <TouchableOpacity
                    style={styles.detailsToggle}
                    onPress={() => {
                      LayoutAnimation.configureNext(CustomFastFade);
                      setShowDetails(!showDetails);
                    }}
                  >
                    <Text style={styles.detailsToggleText}>
                      ⓘ {t('showDetailsBtn')} {showDetails ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {showDetails && (
                    <View style={styles.detailsContainer}>
                      <Text style={styles.detailsText}>
                        {t('calcStep1_pt1')} ({settings.salary} - {taxAmount}) / {monthlyHours}h = {hourlyRate.toFixed(2)} {currencySym}/h
                      </Text>
                      <Text style={styles.detailsText}>
                        {t('calcStep2_pt1')} {parsedPrice} {currencySym} / {hourlyRate.toFixed(2)} {currencySym}
                      </Text>
                    </View>
                  )}

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
                        <Text style={styles.equivalentIcon}>🍝</Text>
                        <View style={styles.equivalentInfo}>
                          <Text style={styles.equivalentName}>{t('eqPasta')}</Text>
                          <Text style={styles.equivalentValue}>{Math.floor(parsedPrice / 0.8)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.equivalentRow}>
                        <Text style={styles.equivalentIcon}>☕</Text>
                        <View style={styles.equivalentInfo}>
                          <Text style={styles.equivalentName}>{t('eqCoffee')}</Text>
                          <Text style={styles.equivalentValue}>{Math.floor(parsedPrice / 5.0)}</Text>
                        </View>
                      </View>

                      <View style={styles.equivalentRow}>
                        <Text style={styles.equivalentIcon}>📚</Text>
                        <View style={styles.equivalentInfo}>
                          <Text style={styles.equivalentName}>{t('eqBook')}</Text>
                          <Text style={styles.equivalentValue}>{Math.floor(parsedPrice / 8.0)}</Text>
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
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Animation de Confettis */}
      {showConfetti && (
        <View key={confettiKey} style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon 
            count={200} 
            origin={{ x: -10, y: 0 }} 
            fallSpeed={3000} 
            fadeOut 
          />
        </View>
      )}

      <SettingsModal
        visible={settingsModalVisible}
        onSave={handleSaveSettings}
        onClose={() => setSettingsModalVisible(false)}
        initialData={settings}
      />

      {!isAdFree && isTrialActive && (
        <TouchableOpacity style={styles.trialBanner} onPress={showPaywall}>
          <Text style={styles.trialText}>{t('supportMessage')}</Text>
        </TouchableOpacity>
      )}

      {!isAdFree && !isTrialActive && (
        <View style={styles.bannerContainer}>
          <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
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
    paddingBottom: 80,
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
    fontSize: 16,
  },
  detailsToggle: {
    paddingVertical: spacing.s,
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  detailsToggleText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  detailsText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
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
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  trialBanner: {
    backgroundColor: '#1E1E1E',
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  trialText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  savedStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  savedStateTitle: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: spacing.l,
  },
  savedStateText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 28,
  },
  quitButton: {
    backgroundColor: '#FF3366',
    padding: spacing.l,
    borderRadius: borderRadius.l,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.l,
  },
  quitButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: spacing.m,
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
