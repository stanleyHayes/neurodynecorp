import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { BORDER, cornerBrackets } from "../theme/styles";
import { getProject } from "../api/client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ProjectDetail">;

function Brackets({ color = BORDER }: { color?: string }) {
  const corners = cornerBrackets(color);
  return (
    <>
      {corners.map((style, i) => (
        <View key={i} style={style} pointerEvents="none" />
      ))}
    </>
  );
}

export default function ProjectDetailScreen({ route }: Props) {
  const { projectId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getProject(projectId);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Project not found."}</Text>
      </View>
    );
  }

  const progress = project.progress ?? 0;
  const team = project.assigned_team_members ?? [];
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Brackets />
        <Text style={styles.title}>{project.title ?? project.name}</Text>
        <Text style={styles.meta}>{(project.type ?? "project").toUpperCase()} · {(project.status ?? "").toUpperCase()}</Text>
        {project.description ? <Text style={styles.description}>{project.description}</Text> : null}

        <View style={styles.progressRow}>
          <Text style={styles.label}>PROGRESS</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>TEAM</Text>
      <View style={styles.card}>
        <Brackets />
        {team.length === 0 ? (
          <Text style={styles.empty}>No team members assigned yet.</Text>
        ) : (
          team.map((member: any) => {
            const name = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || "Team member";
            return (
              <View key={member.id} style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>{name}</Text>
                  <Text style={styles.rowSub}>{(member.role ?? "member").replace(/_/g, " ")}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <Text style={styles.sectionTitle}>MILESTONES</Text>
      <View style={styles.card}>
        <Brackets />
        {milestones.length === 0 ? (
          <Text style={styles.empty}>No milestones yet.</Text>
        ) : (
          milestones.map((milestone: any) => (
            <View key={milestone.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{milestone.name}</Text>
                {milestone.due_date ? (
                  <Text style={styles.rowSub}>
                    Due {new Date(milestone.due_date).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.chip}>{(milestone.status ?? "pending").replace(/_/g, " ").toUpperCase()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  errorText: { color: colors.error, textAlign: "center", fontFamily: fonts.regular },
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    position: "relative",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 6 },
  meta: { fontFamily: fonts.regular, fontSize: 11, color: colors.secondary, letterSpacing: 1.5, marginBottom: 10 },
  description: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: 16 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontFamily: fonts.regular, fontSize: 10, color: colors.textSecondary, letterSpacing: 2 },
  progressValue: { fontFamily: fonts.bold, fontSize: 12, color: colors.text },
  progressTrack: { height: 2, backgroundColor: colors.surfaceLight },
  progressFill: { height: 2, backgroundColor: colors.primary },
  empty: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2, textTransform: "capitalize" },
  chip: { fontFamily: fonts.regular, fontSize: 9, color: colors.primary, letterSpacing: 1 },
});
