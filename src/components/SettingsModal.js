import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { usePremium } from '../context/PremiumContext';

export const SettingsModal = ({ visible, onSave, onClose, initialData }) => {
  const { t, lang, setLang } = useLanguage();
  const { isAdFree, showPaywall, showCustomerCenter } = usePremium();
  const [salary, setSalary] = useState('');
  const [hours, setHours] = useState('');
  const [currency, setCurrency] = useState('\u20ac');

  useEffect(() => {
    if (initialData) {
      setSalary(initialData.salary ? initialData.salary.toString() : '');
      setHours(initialData.hours ? initialData.hours.toString() : '');
      if (initialData.currency) {
        setCurrency(initialData.currency);
      }
      if (initialData.lang && initialData.lang !== lang) {
        setLang(initialData.lang);
      }
    }
  }, [initialData]);

  const handleSave = () => {
    const parsedSalary = parseFloat(salary);
    const parsedHours = parseFloat(hours);

    if (isNaN(parsedSalary) || isNaN(parsedHours) || parsedSalary <= 0 || parsedHours <= 0) {
      alert(t('validationError'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({ salary: parsedSalary, hours: parsedHours, lang, currency });
  };

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await showPaywall();
    // La mise à jour de isAdFree se fait automatiquement via le listener dans PremiumContext
  };

  const handleManageSubscription = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await showCustomerCenter();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => { if (initialData && onClose) onClose(); }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            {initialData && onClose && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{t('settingsTitle')}</Text>
            <Text style={styles.subtitle}>{t('settingsSubtitle')}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('languageLabel')}</Text>
              <View style={styles.langRow}>
                {['fr', 'en'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[styles.langButton, lang === code && styles.langButtonActive]}
                    onPress={() => setLang(code)}
                  >
                    <Text style={[styles.langButtonText, lang === code && styles.langButtonTextActive]}>
                      {code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sélecteur de devise */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('currencyLabel')}</Text>
              <View style={styles.langRow}>
                {['\u20ac', '$'].map((sym) => (
                  <TouchableOpacity
                    key={sym}
                    style={[styles.langButton, currency === sym && styles.langButtonActive]}
                    onPress={() => setCurrency(sym)}
                  >
                    <Text style={[styles.langButtonText, currency === sym && styles.langButtonTextActive]}>
                      {sym}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('salaryLabel')} ({currency})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                placeholder={t('salaryPlaceholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('hoursLabel')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
                placeholder={t('hoursPlaceholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {!isAdFree ? (
              <View style={styles.premiumContainer}>
                <Text style={styles.premiumTitle}>{t('premiumTitle')}</Text>
                <TouchableOpacity style={styles.premiumButton} onPress={handlePurchase}>
                  <Text style={styles.premiumButtonText}>{t('removeAdsBtn')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.premiumContainer}>
                <Text style={styles.premiumTitle}>{t('premiumActiveTitle') || 'SweatCost Pro Actif 💎'}</Text>
                <TouchableOpacity style={styles.premiumButton} onPress={handleManageSubscription}>
                  <Text style={styles.premiumButtonText}>{t('managePurchaseBtn') || 'Gérer mon achat'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.howItWorksLink} 
              onPress={() => Alert.alert(t('howItWorksTitle'), t('howItWorksText'))}
            >
              <Text style={styles.howItWorksText}>{t('howItWorksBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>{t('saveButton')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.l,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  label: {
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    fontSize: 16,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  langButton: {
    flex: 1,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  langButtonActive: {
    backgroundColor: colors.secondary,
  },
  langButtonText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  langButtonTextActive: {
    color: colors.background,
  },
  howItWorksLink: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  howItWorksText: {
    color: colors.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumContainer: {
    marginTop: spacing.s,
    marginBottom: spacing.l,
    alignItems: 'center',
    padding: spacing.s,
    borderWidth: 1,
    borderColor: '#F1C40F',
    borderRadius: borderRadius.m,
    backgroundColor: 'rgba(241, 196, 15, 0.05)',
  },
  premiumTitle: {
    color: '#F1C40F',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  premiumButton: {
    backgroundColor: '#F1C40F',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.m,
  },
  premiumButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
