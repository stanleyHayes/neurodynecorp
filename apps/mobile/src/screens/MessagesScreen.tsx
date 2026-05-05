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
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { BORDER, cornerBrackets } from "../theme/styles";
import { listProjects, listThreads } from "../api/client";

/* ── helpers ─────────────────────────────────────────────────── */

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

function SkeletonMessages() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>MESSAGES</Text>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <SkeletonBlock
              width={40}
              height={40}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <SkeletonBlock
                width="70%"
                height={13}
                style={{ marginBottom: 6 }}
              />
              <SkeletonBlock width="90%" height={11} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ── time formatting ─────────────────────────────────────────── */

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}M AGO`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}H AGO`;
    const days = Math.floor(hours / 24);
    return `${days}D AGO`;
  } catch {
    return "";
  }
}

/* ── main screen ─────────────────────────────────────────────── */

export default function MessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const projectsRes = await listProjects();
        if (cancelled) return;

        const allThreads: any[] = [];
        for (const project of projectsRes.items) {
          try {
            const res = await listThreads(project.id);
            if (cancelled) return;
            if (res.threads && Array.isArray(res.threads)) {
              for (const thread of res.threads) {
                allThreads.push({
                  ...thread,
                  projectName: project.title ?? project.name,
                });
              }
            }
          } catch {
            // skip projects with no threads
          }
        }

        setThreads(allThreads);
      } catch {
        // keep empty on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <SkeletonMessages />;

  if (threads.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>MESSAGES</Text>
        <View style={styles.emptyCard}>
          <Brackets />
          <Text style={styles.emptyText}>NO CONVERSATIONS YET</Text>
          <Text style={styles.emptySubtext}>
            Messages will appear here when you start a conversation on a project.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>MESSAGES</Text>

      {threads.map((thread) => {
        const unread = thread.unread_count ?? 0;
        const subject = thread.subject ?? thread.projectName ?? "Thread";
        const lastMessage = thread.last_message?.content ?? thread.last_message ?? "";
        const time = formatTimeAgo(thread.updated_at ?? thread.created_at ?? "");

        return (
          <TouchableOpacity
            key={thread.id}
            style={styles.card}
            activeOpacity={0.7}
          >
            <Brackets color={unread > 0 ? colors.primaryDark : BORDER} />

            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {subject.charAt(0)}
                </Text>
              </View>

              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.subject} numberOfLines={1}>
                    {subject}
                  </Text>
                  <Text style={styles.time}>{time}</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {lastMessage}
                </Text>
              </View>

              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread}</Text>
                </View>
              )}
            </View>
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
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(108, 99, 255, 0.08)",
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily: fonts.bold,
    color: colors.primaryLight,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  subject: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 10,
  },
  emptyCard: {
    position: "relative",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
