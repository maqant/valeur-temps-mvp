import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../theme/theme';
import Slider from '@react-native-community/slider';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';
import { usePremium } from '../context/PremiumContext';

export const SettingsModal = ({ visible, onSave, onClose, initialData }) => {
  const { lang: globalLang } = useLanguage();
  const { isAdFree, showPaywall, showCustomerCenter } = usePremium();
  const [salary, setSalary] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [hours, setHours] = useState('');
  const [currency, setCurrency] = useState('\u20ac');
  const [localLang, setLocalLang] = useState('fr');

  const tLocal = (key) => translations[localLang]?.[key] || key;

  useEffect(() => {
    if (initialData) {
      setSalary(initialData.salary ? initialData.salary.toString() : '');
      setTaxRate(initialData.taxRate || 0);
      setHours(initialData.hours ? initialData.hours.toString() : '');
      if (initialData.currency) {
        setCurrency(initialData.currency);
      }
      if (initialData.lang) {
        setLocalLang(initialData.lang);
      } else {
        setLocalLang(globalLang);
      }
    } else {
      setLocalLang(globalLang);
    }
  }, [initialData, globalLang]);

  const handleSave = () => {
    const parsedSalary = parseFloat(salary);
    const parsedHours = parseFloat(hours);

    if (isNaN(parsedSalary) || isNaN(parsedHours) || parsedSalary <= 0 || parsedHours <= 0) {
      alert(tLocal('validationError'));
      return;
    }

    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({ salary: parsedSalary, hours: parsedHours, lang: localLang, currency, taxRate });
  };

  const getTaxEmoji = (rate) => {
    if (rate <= 30) return '🤑';
    if (rate <= 60) return '🏠';
    return '☠️';
  };

  const parsedSalaryForUI = parseFloat(salary) || 0;

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
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={() => { if (initialData && onClose) onClose(); }}>
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
            <Text style={styles.title}>{tLocal('settingsTitle')}</Text>
            <Text style={styles.subtitle}>{tLocal('settingsSubtitle')}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{tLocal('languageLabel')}</Text>
              <View style={styles.langRow}>
                {['fr', 'en'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[styles.langButton, localLang === code && styles.langButtonActive]}
                    onPress={() => setLocalLang(code)}
                  >
                    <Text style={[styles.langButtonText, localLang === code && styles.langButtonTextActive]}>
                      {code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sélecteur de devise */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{tLocal('currencyLabel')}</Text>
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
              <Text style={styles.label}>{tLocal('salaryLabel')} ({currency})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                placeholder={tLocal('salaryPlaceholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{tLocal('taxLabel') || 'Taxe de la vraie vie (Loyer, factures...)'}</Text>
              
              <View style={styles.taxHeader}>
                <Text style={styles.taxValue}>{Math.round(taxRate)}%</Text>
                {parsedSalaryForUI > 0 && (
                  isEditingTax ? (
                    <TextInput
                      style={styles.taxDeductionInput}
                      keyboardType="numeric"
                      autoFocus
                      onBlur={() => setIsEditingTax(false)}
                      onSubmitEditing={(e) => {
                        const val = parseFloat(e.nativeEvent.text.replace(',', '.'));
                        if (!isNaN(val) && val >= 0) {
                          let newRate = (val / parsedSalaryForUI) * 100;
                          if (newRate > 90) newRate = 90;
                          setTaxRate(newRate);
                        }
                        setIsEditingTax(false);
                      }}
                      defaultValue={(parsedSalaryForUI * (taxRate / 100)).toFixed(0).toString()}
                    />
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingTax(true)}>
                      <Text style={styles.taxDeduction}>
                        - {(parsedSalaryForUI * (taxRate / 100)).toFixed(0)} {currency}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
                <Text style={styles.taxEmoji}>{getTaxEmoji(taxRate)}</Text>
              </View>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={90}
                step={1}
                value={taxRate}
                onValueChange={setTaxRate}
                minimumTrackTintColor={colors.secondary}
                maximumTrackTintColor="#555555"
                thumbTintColor={colors.secondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{tLocal('hoursLabel')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
                placeholder={tLocal('hoursPlaceholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {!isAdFree ? (
              <View style={styles.premiumContainer}>
                <Text style={styles.premiumTitle}>{tLocal('premiumTitle')}</Text>
                <TouchableOpacity style={styles.premiumButton} onPress={handlePurchase}>
                  <Text style={styles.premiumButtonText}>{tLocal('removeAdsBtn')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.premiumContainer}>
                <Text style={styles.premiumTitle}>{tLocal('premiumActiveTitle') || 'SweatCost Pro Actif 💎'}</Text>
                <TouchableOpacity style={styles.premiumButton} onPress={handleManageSubscription}>
                  <Text style={styles.premiumButtonText}>{tLocal('managePurchaseBtn') || 'Gérer mon achat'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.howItWorksLink} 
              onPress={() => Alert.alert(tLocal('howItWorksTitle'), tLocal('howItWorksText'))}
            >
              <Text style={styles.howItWorksText}>{tLocal('howItWorksBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>{tLocal('saveButton')}</Text>
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
  taxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  taxValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  taxDeduction: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
    padding: spacing.xs,
  },
  taxDeductionInput: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#E74C3C',
    padding: 0,
    minWidth: 50,
    textAlign: 'center',
  },
  taxEmoji: {
    fontSize: 20,
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
