import { StatusBar } from 'expo-status-bar';
import './lib/env-check'; // Validate environment on app startup
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
