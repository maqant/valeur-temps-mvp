import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme/theme';
import { SettingsModal } from '../components/SettingsModal';
import { loadSettings, saveSettings } from '../utils/storage';
import { calculateHourlyRate, calculateWorkDayHours, convertCostToTime } from '../utils/calculations';

export const MainScreen = () => {
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const [price, setPrice] = useState('');
  const [uses, setUses] = useState('1');

  // Ref pour throttler les haptics du slider (100ms minimum entre chaque vibration)
  const lastHapticRef = useRef(0);

  useEffect(() => {
    const initializeApp = async () => {
      const savedSettings = await loadSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      } else {
        setSettingsModalVisible(true);
      }
      setIsReady(true);
    };
    initializeApp();
  }, []);

  const handleSaveSettings = async (newSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    setSettingsModalVisible(false);
  };

  // Valeurs dérivées via useMemo — plus besoin de 3 states + useCallback + useEffect
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

  const handleSliderChange = (value) => {
    const rounded = Math.round(value);
    // Éviter les re-renders inutiles si la valeur n'a pas changé
    if (rounded.toString() === uses) return;

    // Throttle haptic : 100ms minimum entre chaque vibration
    const now = Date.now();
    if (now - lastHapticRef.current > 100) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticRef.current = now;
    }
    setUses(rounded.toString());
  };

  const formatTimeResult = (time) => {
    let result = [];
    if (time.days > 0) result.push(`${time.days} jour${time.days > 1 ? 's' : ''}`);
    if (time.hours > 0) result.push(`${time.hours} h`);
    if (time.minutes > 0) result.push(`${time.minutes} min`);

    if (result.length === 0) return '0 min';
    return result.join(' ');
  };

  if (!isReady) return null;

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
            <Text style={styles.appTitle}>Your Life Cost</Text>
            <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.settingsIcon}>
              <Text style={styles.settingsIconText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Prix de l'objet (€)</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              maxLength={10}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Nombre d'utilisations estimées</Text>
            <View style={styles.usesInputContainer}>
              <TextInput
                style={styles.usesInput}
                keyboardType="numeric"
                value={uses}
                onChangeText={(val) => {
                  // Accepter uniquement des chiffres, fallback à '1' si vide
                  const cleaned = val.replace(/[^0-9]/g, '');
                  setUses(cleaned || '1');
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
              minimumTrackTintColor={colors.secondary}
              maximumTrackTintColor={colors.surface}
              thumbTintColor={colors.secondary}
            />
          </View>

          {price ? (
            <View style={styles.resultsContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Coût Total en Temps</Text>
                <Text style={styles.resultValuePrimary}>{formatTimeResult(timeCost)}</Text>
                <Text style={styles.resultSubtext}>de travail</Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.resultCard, styles.halfCard]}>
                  <Text style={styles.resultLabel}>Coût / Utilisation</Text>
                  <Text style={styles.resultValueSecondary}>{costPerUse.toFixed(2)} €</Text>
                </View>
                <View style={[styles.resultCard, styles.halfCard]}>
                  <Text style={styles.resultLabel}>Temps / Utilisation</Text>
                  <Text style={styles.resultValueSecondary}>{formatTimeResult(timePerUse)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>Entrez un prix pour voir son coût réel en temps de vie.</Text>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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
  settingsIconText: {
    fontSize: 24,
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
    marginTop: spacing.m,
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
