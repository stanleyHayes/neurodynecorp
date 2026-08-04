import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../hooks/useAuth";
import { createPrivacyRequest, listMyPrivacyRequests } from "../api/client";
import {
  ACCOUNT_DELETION_URL,
  PRIVACY_URL,
  SUPPORT_URL,
  TERMS_URL,
} from "../config";

export default function ProfileScreen({ navigation }: { navigation?: any }) {
  const { user, logout } = useAuth();
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [pendingErasure, setPendingErasure] = useState(false);

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const email = user?.email ?? "";
  const company = user?.company ?? "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  useEffect(() => {
    listMyPrivacyRequests()
      .then(({ items }) => setPendingErasure(items.some((item) => item.type === "erasure" && ["received", "in_progress"].includes(item.status))))
      .catch(() => undefined);
  }, []);

  const openUrl = (url: string) => void Linking.openURL(url);

  const requestExport = async () => {
    setPrivacyLoading(true);
    try {
      await createPrivacyRequest("export", email);
      Alert.alert("Export requested", "We received your request and will notify you when your account data is ready.");
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Please try again later.");
    } finally {
      setPrivacyLoading(false);
    }
  };

  const requestDeletion = () => {
    Alert.alert(
      "Delete your account?",
      "This requests permanent deletion of your NeuroDyne account and associated personal data, except records we must retain by law. This cannot be undone after completion.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request deletion",
          style: "destructive",
          onPress: async () => {
            setPrivacyLoading(true);
            try {
              await createPrivacyRequest("erasure", email);
              setPendingErasure(true);
              Alert.alert("Deletion requested", "Your request is now recorded. We will verify and process it, normally within 30 days.");
            } catch (error) {
              Alert.alert("Request failed", error instanceof Error ? error.message : "Please try again later.");
            } finally {
              setPrivacyLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.name}>{fullName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        {company ? <Text style={styles.company}>{company}</Text> : null}
      </View>

      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.section}>
        <MenuItem label="Billing & payments" onPress={() => navigation?.navigate("Billing")} />
        <MenuItem label="Notification settings" onPress={() => void Linking.openSettings()} />
        <MenuItem label="Password & sign-in help" onPress={() => openUrl(SUPPORT_URL)} />
        <MenuItem label="Help & support" onPress={() => openUrl(SUPPORT_URL)} />
      </View>

      <Text style={styles.sectionLabel}>PRIVACY & LEGAL</Text>
      <View style={styles.section}>
        <MenuItem label="Privacy policy" onPress={() => openUrl(PRIVACY_URL)} />
        <MenuItem label="Terms of service" onPress={() => openUrl(TERMS_URL)} />
        <MenuItem label="Request a copy of my data" onPress={() => void requestExport()} disabled={privacyLoading} />
        <MenuItem label="Account deletion information" onPress={() => openUrl(ACCOUNT_DELETION_URL)} />
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Delete account</Text>
        <Text style={styles.dangerCopy}>
          Permanently remove your account and associated personal data. Some transaction or legal records may be retained where required.
        </Text>
        <TouchableOpacity
          style={[styles.deleteButton, (privacyLoading || pendingErasure) && styles.disabled]}
          onPress={requestDeletion}
          disabled={privacyLoading || pendingErasure}
          accessibilityRole="button"
          accessibilityLabel="Request permanent account deletion"
        >
          {privacyLoading ? <ActivityIndicator color={colors.error} /> : (
            <Text style={styles.deleteText}>{pendingErasure ? "Deletion request pending" : "Request account deletion"}</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => void logout()} accessibilityRole="button">
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>NeuroDyne Corp · Version 1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuItem, disabled && styles.disabled]} onPress={onPress} disabled={disabled} accessibilityRole="button">
      <Text style={styles.menuText}>{label}</Text><Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48 },
  header: { alignItems: "center", paddingVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "700", color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  company: { fontSize: 14, color: colors.secondary, marginTop: 2 },
  sectionLabel: { color: colors.textSecondary, fontSize: 12, letterSpacing: 1.5, marginTop: 18, marginBottom: 8 },
  section: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: "hidden" },
  menuItem: { backgroundColor: colors.surface, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuText: { fontSize: 15, color: colors.text, fontWeight: "500" },
  chevron: { color: colors.textSecondary, fontSize: 24 },
  dangerZone: { marginTop: 28, padding: 16, borderWidth: 1, borderColor: "rgba(239,68,68,.35)", borderRadius: 8, backgroundColor: "rgba(239,68,68,.06)" },
  dangerTitle: { color: colors.error, fontSize: 16, fontWeight: "700" },
  dangerCopy: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  deleteButton: { marginTop: 14, borderWidth: 1, borderColor: colors.error, borderRadius: 6, padding: 13, alignItems: "center" },
  deleteText: { color: colors.error, fontWeight: "700" },
  disabled: { opacity: 0.55 },
  logoutButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 6, marginTop: 24, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  logoutText: { fontSize: 15, color: colors.text, fontWeight: "600" },
  version: { color: colors.textSecondary, textAlign: "center", fontSize: 12, marginTop: 18 },
});
