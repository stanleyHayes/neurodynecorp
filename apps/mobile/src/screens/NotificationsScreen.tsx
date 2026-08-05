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
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/client";
import { useSocket } from "../hooks/useSocket";

/* ── types ──────────────────────────────────────────────────── */

type NotificationType =
  | "status_change"
  | "new_message"
  | "invoice"
  | "approval";

const typeConfig: Record<NotificationType, { icon: string; color: string }> = {
  status_change: { icon: "\u21BB", color: colors.primary },
  new_message: { icon: "\u2709", color: colors.secondary },
  invoice: { icon: "$", color: colors.warning },
  approval: { icon: "\u2713", color: colors.success },
};

const defaultTypeConfig = { icon: "\u2022", color: colors.textSecondary };

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

function SkeletonNotifications() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <SkeletonBlock width={60} height={16} />
        <SkeletonBlock width={100} height={28} />
      </View>
      <View style={styles.list}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.card}>
            <View style={styles.row}>
              <SkeletonBlock
                width={36}
                height={36}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <SkeletonBlock
                  width="60%"
                  height={13}
                  style={{ marginBottom: 6 }}
                />
                <SkeletonBlock
                  width="85%"
                  height={11}
                  style={{ marginBottom: 4 }}
                />
                <SkeletonBlock width={50} height={9} />
              </View>
            </View>
          </View>
        ))}
      </View>
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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await listNotifications();
        if (!cancelled) setNotifications(res.items);
      } catch {
        // keep empty on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Listen for real-time notifications and prepend to list
  useEffect(() => {
    const cleanup = on("notification", (data: any) => {
      setNotifications((prev) => [
        { id: data.id ?? Date.now().toString(), ...data, read: false, created_at: data.timestamp ?? new Date().toISOString() },
        ...prev,
      ]);
    });
    return cleanup;
  }, [on]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // silently fail
    }
  };

  if (loading) return <SkeletonNotifications />;

  return (
    <View style={styles.wrapper}>
      {/* ── top bar ──────────────────────────────────────────── */}
      <View style={styles.topBar}>
        {unreadCount > 0 && (
          <View style={styles.unreadRow}>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
            <Text style={styles.unreadLabel}>UNREAD</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
          activeOpacity={0.7}
        >
          <Text style={styles.markAllText}>MARK ALL READ</Text>
        </TouchableOpacity>
      </View>

      {/* ── notifications list ───────────────────────────────── */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => {
          const config = typeConfig[notification.type as NotificationType] ?? defaultTypeConfig;
          const { icon, color } = config;
          const time = notification.time ?? formatTimeAgo(notification.created_at ?? notification.createdAt ?? "");
          return (
            <TouchableOpacity
              key={notification.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handleMarkRead(notification.id)}
            >
              <Brackets
                color={!notification.read ? colors.primaryDark : BORDER}
              />

              <View style={styles.row}>
                <View
                  style={[styles.iconSquare, { borderColor: `${color}40` }]}
                >
                  <Text style={[styles.iconText, { color }]}>{icon}</Text>
                </View>

                <View style={styles.content}>
                  <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    {!notification.read && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.body} numberOfLines={2}>
                    {notification.body ?? notification.message ?? ""}
                  </Text>
                  <Text style={styles.time}>{time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ── styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unreadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadBadge: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadgeText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 10,
  },
  unreadLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  markAllButton: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: "auto",
  },
  markAllText: {
    fontFamily: fonts.bold,
    color: colors.primaryLight,
    fontSize: 10,
    letterSpacing: 2,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
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
    alignItems: "flex-start",
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 17,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
});
