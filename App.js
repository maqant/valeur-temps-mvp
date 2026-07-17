import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens/MainScreen';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { PremiumProvider } from './src/context/PremiumContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PremiumProvider>
        <LanguageProvider>
          <View style={styles.container}>
            <StatusBar style="light" />
            <MainScreen />
          </View>
        </LanguageProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
