import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { FullScreenLoading } from '../components/LoadingSpinner';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import KanbanScreen from '../screens/KanbanScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import UsersScreen from '../screens/UsersScreen';
import TaskTypesScreen from '../screens/TaskTypesScreen';
import StatsScreen from '../screens/StatsScreen';
import MenuScreen from '../screens/MenuScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ icon, focused, color }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>{icon}</Text>
  </View>
);

// Main tab navigator (for authenticated users)
const MainTabNavigator = () => {
  const { isManager } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="KanbanTab"
        component={KanbanScreen}
        options={{
          tabBarLabel: 'Kanban',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📋" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Estatísticas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📊" focused={focused} color={color} />
          ),
        }}
      />
      {isManager() && (
        <Tab.Screen
          name="UsersTab"
          component={UsersScreen}
          options={{
            tabBarLabel: 'Utilizadores',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="👥" focused={focused} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="☰" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth stack (for non-authenticated users)
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Main app stack (for authenticated users)
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    {/* Main Tab Navigator */}
    <Stack.Screen
      name="MainTabs"
      component={MainTabNavigator}
      options={{ animation: 'fade' }}
    />

    {/* Kanban Screen (can also be accessed from menu) */}
    <Stack.Screen name="Kanban" component={KanbanScreen} />

    {/* Task Details/Form Screen */}
    <Stack.Screen
      name="TaskDetails"
      component={TaskDetailsScreen}
      options={{ animation: 'slide_from_bottom' }}
    />

    {/* Task Form (Create/Edit) */}
    <Stack.Screen
      name="TaskForm"
      component={TaskDetailsScreen}
      options={{ animation: 'slide_from_bottom' }}
    />

    {/* Users Management Screen */}
    <Stack.Screen name="Users" component={UsersScreen} />

    {/* Task Types Management Screen */}
    <Stack.Screen name="TaskTypes" component={TaskTypesScreen} />

    {/* Statistics Screen */}
    <Stack.Screen name="Stats" component={StatsScreen} />

    {/* Menu Screen */}
    <Stack.Screen name="Menu" component={MenuScreen} />

    {/* Profile Screen (placeholder - using Menu for now) */}
    <Stack.Screen name="Profile" component={MenuScreen} />
  </Stack.Navigator>
);

// Root navigator component
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <FullScreenLoading text="A carregar..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
});

export default AppNavigator;
