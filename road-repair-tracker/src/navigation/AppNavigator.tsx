import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { MyReportsScreen } from '../screens/MyReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ComplaintDetailScreen } from '../screens/ComplaintDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OTPVerificationScreen } from '../screens/OTPVerificationScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AdminComplaintDetailScreen } from '../screens/AdminComplaintDetailScreen';
import { AdminContractorsScreen } from '../screens/AdminContractorsScreen';
import { AdminContractorDetailScreen } from '../screens/AdminContractorDetailScreen';
import { AdminAnalyticsScreen } from '../screens/AdminAnalyticsScreen';
import { AdminComplaintsScreen } from '../screens/AdminComplaintsScreen';
import { AdminEmailsScreen } from '../screens/AdminEmailsScreen';
import { theme } from '../../theme';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#18181b' : '#e4e4e7',
          elevation: 4,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark ? '#71717a' : '#71717a',
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.labelSm.fontSize,
          fontWeight: theme.typography.labelSm.fontWeight as any,
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="ReportPlaceholder" 
        component={View} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Report');
          },
        })}
        options={{
          title: 'Report',
          tabBarIcon: () => (
            <View style={styles.fabContainer}>
              <View style={styles.fab}>
                <MaterialIcons name="add-a-photo" size={26} color={theme.colors.onPrimary} />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="MyReportsTab" 
        component={MyReportsScreen} 
        options={{
          title: 'My Reports',
          tabBarIcon: ({ color }) => <MaterialIcons name="assignment" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

function AdminBottomTabs() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#18181b' : '#e4e4e7',
          elevation: 4,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark ? '#71717a' : '#71717a',
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.labelSm.fontSize,
          fontWeight: theme.typography.labelSm.fontWeight as any,
        }
      }}
    >
      <Tab.Screen 
        name="AdminDashboardTab" 
        component={AdminDashboardScreen} 
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="AdminComplaintsTab" 
        component={AdminComplaintsScreen} 
        options={{
          title: 'Complaints',
          tabBarIcon: ({ color }) => <MaterialIcons name="report-problem" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="AdminEmailsTab" 
        component={AdminEmailsScreen} 
        options={{
          title: 'Emails',
          tabBarIcon: ({ color }) => <MaterialIcons name="mail" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="AdminContractorsTab" 
        component={AdminContractorsScreen} 
        options={{
          title: 'Contractors',
          tabBarIcon: ({ color }) => <MaterialIcons name="engineering" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="AdminAnalyticsTab" 
        component={AdminAnalyticsScreen} 
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <MaterialIcons name="insights" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isDark } = useTheme();

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
      card: '#ffffff',
      text: '#09090b',
      border: '#e4e4e7',
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#000000',
      card: '#000000',
      text: '#ffffff',
      border: '#18181b',
    },
  };

  return (
    <NavigationContainer theme={isDark ? customDarkTheme : customLightTheme}>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? '#000000' : '#ffffff' },
          headerTintColor: isDark ? '#ffffff' : '#09090b',
          headerTitleStyle: { 
            fontFamily: theme.typography.fontFamily,
            fontWeight: '600' as any 
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={BottomTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Report" 
          component={ReportScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ComplaintDetail" 
          component={ComplaintDetailScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminTabs" 
          component={AdminBottomTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminComplaintDetail" 
          component={AdminComplaintDetailScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminContractorDetail" 
          component={AdminContractorDetailScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminComplaints" 
          component={AdminComplaintsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminEmails" 
          component={AdminEmailsScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 8,
  },
  badgeTopRight: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTextSmall: {
    color: theme.colors.onError,
    fontSize: 10,
    fontWeight: 'bold',
  }
});
