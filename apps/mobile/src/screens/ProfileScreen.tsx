import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../hooks/useAuth";

export default function ProfileScreen({ navigation }: { navigation?: any }) {
  const { user, logout } = useAuth();

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const email = user?.email ?? "";
  const company = user?.company ?? "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await logout();
      if (navigation) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    } catch {
      // silently fail
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        {company ? <Text style={styles.company}>{company}</Text> : null}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Billing & Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { alignItems: "center", paddingVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "700", color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  company: { fontSize: 14, color: colors.secondary, marginTop: 2 },
  section: { marginTop: 16 },
  menuItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuText: { fontSize: 15, color: colors.text, fontWeight: "500" },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: 16,
    borderRadius: 4,
    marginTop: 24,
    alignItems: "center",
  },
  logoutText: { fontSize: 15, color: colors.error, fontWeight: "600" },
});
