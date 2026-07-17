import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens/MainScreen';
import { LanguageProvider } from './src/i18n/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <MainScreen />
        </View>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
