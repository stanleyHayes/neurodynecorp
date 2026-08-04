import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { getUnreadNotificationCount } from "../api/client";

import DashboardScreen from "../screens/DashboardScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import MessagesScreen from "../screens/MessagesScreen";
import BillingScreen from "../screens/BillingScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.error,
  },
};

interface TabDef {
  name: string;
  component: React.ComponentType<any>;
  permission?: string;
}

const ALL_TABS: TabDef[] = [
  { name: "Dashboard", component: DashboardScreen, permission: "dashboard:read" },
  { name: "Projects", component: ProjectsScreen, permission: "projects:read" },
  { name: "Documents", component: DocumentsScreen, permission: "documents:read" },
  { name: "Messages", component: MessagesScreen, permission: "messages:read" },
  { name: "Billing", component: BillingScreen, permission: "billing:read" },
  { name: "Notifications", component: NotificationsScreen, permission: "notifications:read" },
  { name: "Profile", component: ProfileScreen },
];

function MainTabs() {
  const { hasPermission, isAuthenticated } = useAuth();
  const { on } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.unread);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount();
  }, [isAuthenticated, fetchUnreadCount]);

  // Increment on real-time notification
  useEffect(() => {
    const cleanup = on("notification", () => {
      setUnreadCount((prev) => prev + 1);
    });
    return cleanup;
  }, [on]);

  const visibleTabs = ALL_TABS.filter(
    (tab) => !tab.permission || hasPermission(tab.permission),
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bold },
        tabBarLabelStyle: { fontFamily: fonts.regular },
      }}
    >
      {visibleTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={
            tab.name === "Notifications"
              ? { tabBarBadge: unreadCount > 0 ? unreadCount : undefined }
              : undefined
          }
          listeners={
            tab.name === "Notifications"
              ? { tabPress: () => { fetchUnreadCount(); } }
              : undefined
          }
        />
      ))}
    </Tab.Navigator>
  );
}

interface AppNavigatorProps {
  onReady?: () => void;
}

export default function AppNavigator({ onReady }: AppNavigatorProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading} onLayout={onReady}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={darkTheme} onReady={onReady}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
