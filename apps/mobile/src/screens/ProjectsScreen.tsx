import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { BORDER, cornerBrackets } from "../theme/styles";
import { listProjects } from "../api/client";
import type { RootStackParamList } from "../navigation/AppNavigator";

/* ── helpers ─────────────────────────────────────────────────── */

const statusColor = (s: string) => {
  if (s === "QA" || s === "Testing") return colors.warning;
  if (s === "Planning") return colors.secondary;
  return colors.primary;
};

function getNextMilestone(project: any): string {
  if (project.milestones && Array.isArray(project.milestones)) {
    const incomplete = project.milestones.find(
      (m: any) => m.status !== "completed" && m.status !== "done",
    );
    if (incomplete) return incomplete.title ?? incomplete.name ?? "No milestones";
  }
  return "No milestones";
}

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

function SkeletonBlock({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          backgroundColor: colors.surfaceLight,
          opacity,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

function SkeletonProjects() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>PROJECTS</Text>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock width="55%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBlock width={60} height={10} style={{ marginBottom: 14 }} />
          <SkeletonBlock
            width="100%"
            height={2}
            style={{ marginBottom: 10 }}
          />
          <SkeletonBlock width="40%" height={10} />
        </View>
      ))}
    </View>
  );
}

/* ── main screen ─────────────────────────────────────────────── */

export default function ProjectsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await listProjects();
        if (!cancelled) setProjects(res.items);
      } catch {
        // keep empty on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <SkeletonProjects />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>PROJECTS</Text>

      {projects.map((project) => {
        const sc = statusColor(project.status);
        const progress = project.progress ?? 0;
        const nextMilestone = getNextMilestone(project);
        const teamCount = (project.assigned_team_members ?? []).length;
        return (
          <TouchableOpacity
            key={project.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ProjectDetail", { projectId: project.id })}
          >
            <Brackets />

            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{project.title ?? project.name}</Text>
                <Text style={styles.type}>{(project.type ?? "PROJECT").toUpperCase()}</Text>
              </View>
              <View style={[styles.statusChip, { borderColor: sc }]}>
                <Text style={[styles.statusText, { color: sc }]}>
                  {(project.status ?? "").toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.label}>PROGRESS</Text>
              <Text style={styles.progressValue}>{progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: sc },
                ]}
              />
            </View>

            <Text style={styles.milestone}>
              NEXT: {nextMilestone.toUpperCase()}
              {teamCount > 0 ? `  ·  TEAM ${teamCount}` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* ── styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  card: {
    position: "relative",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  type: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginTop: 3,
  },
  statusChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  progressValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.text,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.surfaceLight,
    marginBottom: 12,
  },
  progressFill: {
    height: 2,
  },
  milestone: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
});
