import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/theme';

export const SettingsModal = ({ visible, onSave, onClose, initialData }) => {
  const [salary, setSalary] = useState('');
  const [hours, setHours] = useState('');

  useEffect(() => {
    if (initialData) {
      setSalary(initialData.salary ? initialData.salary.toString() : '');
      setHours(initialData.hours ? initialData.hours.toString() : '');
    }
  }, [initialData]);

  const handleSave = () => {
    const parsedSalary = parseFloat(salary);
    const parsedHours = parseFloat(hours);

    if (isNaN(parsedSalary) || isNaN(parsedHours) || parsedSalary <= 0 || parsedHours <= 0) {
      alert("Veuillez entrer des valeurs valides supérieures à zéro.");
      return;
    }

    onSave({ salary: parsedSalary, hours: parsedHours });
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
            <Text style={styles.title}>Configuration</Text>
            <Text style={styles.subtitle}>Pour calculer le coût réel, nous avons besoin de connaître la valeur de votre temps.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Salaire net mensuel (€)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                placeholder="Ex: 2500"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Heures de travail par semaine</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
                placeholder="Ex: 35"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Enregistrer et Commencer</Text>
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
});
