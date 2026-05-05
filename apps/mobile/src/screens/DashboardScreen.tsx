import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { BORDER, cornerBrackets } from "../theme/styles";
import { listProjects, listInvoices, listNotifications } from "../api/client";
import { useAuth } from "../hooks/useAuth";

/* ── helpers ─────────────────────────────────────────────────── */

const statusColor = (s: string) => {
  if (s === "Testing" || s === "QA") return colors.warning;
  if (s === "Planning") return colors.secondary;
  return colors.primary;
};

/* ── corner bracket component ────────────────────────────────── */

function Brackets({ color = colors.primary }: { color?: string }) {
  const corners = cornerBrackets(color);
  return (
    <>
      {corners.map((style, i) => (
        <View key={i} style={style} pointerEvents="none" />
      ))}
    </>
  );
}

/* ── skeleton pulse ──────────────────────────────────────────── */

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

function SkeletonDashboard() {
  return (
    <View style={styles.container}>
      <SkeletonBlock width={180} height={18} style={{ marginBottom: 24 }} />

      <View style={styles.statsGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.statCell,
              i % 2 === 0 && styles.statBorderRight,
              i < 2 && styles.statBorderBottom,
            ]}
          >
            <SkeletonBlock width={20} height={10} style={{ marginBottom: 8 }} />
            <SkeletonBlock width={40} height={28} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={80} height={10} />
          </View>
        ))}
      </View>

      <SkeletonBlock
        width={120}
        height={12}
        style={{ marginTop: 28, marginBottom: 14, marginLeft: 16 }}
      />

      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.projectCard}>
          <SkeletonBlock width="60%" height={14} style={{ marginBottom: 10 }} />
          <SkeletonBlock width={60} height={18} style={{ marginBottom: 10 }} />
          <SkeletonBlock width="100%" height={2} />
        </View>
      ))}
    </View>
  );
}

/* ── main screen ─────────────────────────────────────────────── */

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "ACTIVE PROJECTS", value: "0" },
    { label: "PENDING INVOICES", value: "0" },
    { label: "UNREAD MESSAGES", value: "0" },
    { label: "DOCUMENTS", value: "0" },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [projectsRes, invoicesRes, notificationsRes] = await Promise.all([
          listProjects().catch(() => ({ items: [], total: 0 })),
          listInvoices().catch(() => ({ items: [], total: 0 })),
          listNotifications().catch(() => ({ items: [], total: 0, unread: 0 })),
        ]);

        if (cancelled) return;

        const activeProjects = projectsRes.items.filter(
          (p: any) => p.status !== "completed" && p.status !== "cancelled",
        );
        const pendingInvoices = invoicesRes.items.filter(
          (inv: any) => inv.status === "pending" || inv.status === "Pending",
        );

        setProjects(projectsRes.items.slice(0, 5));
        setStats([
          { label: "ACTIVE PROJECTS", value: String(activeProjects.length) },
          { label: "PENDING INVOICES", value: String(pendingInvoices.length) },
          { label: "UNREAD MESSAGES", value: String((notificationsRes as any).unread ?? 0) },
          { label: "DOCUMENTS", value: String(projectsRes.total) },
        ]);
      } catch {
        // keep defaults on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <SkeletonDashboard />;

  const firstName = user?.first_name ?? "THERE";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>WELCOME BACK, {firstName.toUpperCase()}</Text>

      {/* ── 2x2 Stats Grid ───────────────────────────────────── */}
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            style={[
              styles.statCell,
              i % 2 === 0 && styles.statBorderRight,
              i < 2 && styles.statBorderBottom,
            ]}
          >
            <Brackets />
            <Text style={styles.statIndex}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Projects ─────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>YOUR PROJECTS</Text>

      {projects.map((project) => {
        const sc = statusColor(project.status);
        const progress = project.progress ?? 0;
        return (
          <View key={project.id ?? project.title} style={styles.projectCard}>
            <Brackets color={BORDER} />

            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle}>{project.title ?? project.name}</Text>
              <View style={[styles.statusChip, { borderColor: sc }]}>
                <Text style={[styles.statusChipText, { color: sc }]}>
                  {(project.status ?? "").toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.progressText}>{progress}%</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: sc },
                ]}
              />
            </View>
          </View>
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
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 3,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.surface,
  },
  statCell: {
    width: "50%",
    padding: 18,
    position: "relative",
  },
  statBorderRight: {
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  statBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  statIndex: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.text,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 14,
  },
  projectCard: {
    position: "relative",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  projectTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  progressText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.surfaceLight,
  },
  progressFill: {
    height: 2,
  },
});
