import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import CalendarScreen from '../screens/Main/CalendarScreen';
import MyScreen from '../screens/Main/MyScreen';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { lightTheme } from '../theme';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Calendar: undefined;
  My: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Calendar') {
            return <MaterialIcons name="calendar-today" size={24} color={color} />;
          } else if (route.name === 'My') {
            return <Ionicons name="person-outline" size={24} color={color} />;
          }
        },
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: lightTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: lightTheme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 80 + insets.bottom : 80,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          tabBarLabel: '캘린더',
        }}
      />
      <Tab.Screen 
        name="My" 
        component={MyScreen}
        options={{
          tabBarLabel: '마이',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const { isAuthenticated, initialize, refreshSession } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    console.log('Auth state changed in Navigator:', {
      isLoading,
      hasSeenOnboarding,
      isAuthenticated,
    });
  }, [isLoading, hasSeenOnboarding, isAuthenticated]);

  const initializeApp = async () => {
    try {
      // Check if user has seen onboarding
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
      if (onboardingStatus === 'true') {
        setHasSeenOnboarding(true);
      }

      // Initialize auth
      await initialize();

      // Handle deep linking for auth callback
      const handleDeepLink = (url: string) => {
        console.log('Deep link received:', url);
        if (url.includes('yourpoint://auth')) {
          console.log('Auth callback received, refreshing session...');
          // Force refresh auth state
          setTimeout(() => {
            refreshSession();
          }, 1000);
        }
      };

      // Listen for incoming links
      const subscription = Linking.addEventListener('url', ({ url }) => {
        handleDeepLink(url);
      });

      // Check if app was opened with a link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }

      return () => subscription?.remove();
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashFinish = () => {
    // Splash will finish when initialization is complete
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}