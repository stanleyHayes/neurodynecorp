import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { BORDER, cornerBrackets } from "../theme/styles";
import { listProjects, listThreads, getMessages, sendMessage, createThread } from "../api/client";

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
          <Brackets />
          <View style={styles.row}>
            <SkeletonBlock width={40} height={40} />
            <View style={[styles.content, { marginLeft: 12 }]}>
              <SkeletonBlock width="70%" height={12} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="90%" height={10} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

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

function formatClock(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/* ── main screen ─────────────────────────────────────────────── */

export default function MessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [composing, setComposing] = useState(false);
  const [newProjectId, setNewProjectId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const reloadThreads = async () => {
    const projectsRes = await listProjects();
    setProjects(projectsRes.items ?? []);
    const allThreads: any[] = [];
    for (const project of projectsRes.items ?? []) {
      try {
        const res = await listThreads(project.id);
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
    setThreads(
      allThreads.sort((a, b) => {
        const bt = new Date(b.last_message_at ?? b.lastMessageAt ?? b.updated_at ?? b.updatedAt ?? b.created_at ?? b.createdAt ?? 0).getTime();
        const at = new Date(a.last_message_at ?? a.lastMessageAt ?? a.updated_at ?? a.updatedAt ?? a.created_at ?? a.createdAt ?? 0).getTime();
        return bt - at;
      }),
    );
    return allThreads;
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        await reloadThreads();
      } catch {
        // keep empty on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected?.id) return;
    let cancelled = false;
    setMessagesLoading(true);
    getMessages(selected.id)
      .then((res) => {
        if (cancelled) return;
        setMessages(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.id]);

  const openCompose = async () => {
    try {
      const projectsRes = await listProjects();
      const items = projectsRes.items ?? [];
      setProjects(items);
      if (items[0]) {
        setNewProjectId(items[0].id);
        setNewTitle(`${items[0].title ?? items[0].name ?? "Project"} — discussion`);
      } else {
        setNewProjectId("");
        setNewTitle("");
      }
      setComposing(true);
    } catch {
      Alert.alert("Unable to start", "Could not load your projects.");
    }
  };

  const handleCreateThread = async () => {
    if (!newProjectId || !newTitle.trim() || creating) return;
    setCreating(true);
    try {
      const created = await createThread(newProjectId, newTitle.trim(), []);
      const all = await reloadThreads();
      setComposing(false);
      const match =
        all.find((t) => t.id === created?.id) ??
        all[0] ??
        { ...created, projectName: projects.find((p) => p.id === newProjectId)?.title };
      if (match?.id) setSelected(match);
    } catch (err: any) {
      Alert.alert("Could not create thread", err?.message ?? "Try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    if (!selected?.id || !draft.trim() || sending) return;
    const text = draft.trim();
    setSending(true);
    setDraft("");
    try {
      const sent = await sendMessage(selected.id, text);
      setMessages((prev) => [...prev, sent]);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selected.id ? { ...t, last_message: text } : t,
        ),
      );
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <SkeletonMessages />;

  if (composing) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setComposing(false)} style={styles.backRow}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>NEW CONVERSATION</Text>
        <Text style={styles.emptySubtext}>Choose a project, then start the thread.</Text>
        {(projects.length === 0 ? (
          <Text style={styles.emptySubtext}>No projects available.</Text>
        ) : (
          projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.card, newProjectId === p.id && styles.cardSelected]}
              onPress={() => {
                setNewProjectId(p.id);
                setNewTitle(`${p.title ?? p.name ?? "Project"} — discussion`);
              }}
            >
              <Brackets color={newProjectId === p.id ? colors.primaryDark : BORDER} />
              <Text style={styles.subject}>{String(p.title ?? p.name ?? p.id).toUpperCase()}</Text>
            </TouchableOpacity>
          ))
        ))}
        <TextInput
          style={[styles.input, { marginTop: 12, marginBottom: 12 }]}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Thread title"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!newProjectId || !newTitle.trim() || creating) && styles.sendBtnDisabled]}
          disabled={!newProjectId || !newTitle.trim() || creating}
          onPress={() => void handleCreateThread()}
        >
          <Text style={styles.sendText}>{creating ? "…" : "START THREAD"}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (selected) {
    const subject =
      selected.subject ?? selected.title ?? selected.projectName ?? "Thread";
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <TouchableOpacity onPress={() => setSelected(null)} style={styles.backRow}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>{subject.toUpperCase()}</Text>

        <ScrollView style={styles.threadBody} showsVerticalScrollIndicator={false}>
          {messagesLoading ? (
            <ActivityIndicator color={colors.primaryLight} style={{ marginTop: 24 }} />
          ) : messages.length === 0 ? (
            <Text style={styles.emptySubtext}>No messages yet. Say hello.</Text>
          ) : (
            messages.map((m) => (
              <View key={m.id} style={styles.messageBubble}>
                <Text style={styles.messageBody}>{m.content}</Text>
                <Text style={styles.messageTime}>
                  {formatClock(m.created_at ?? m.createdAt)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message…"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            disabled={!draft.trim() || sending}
            onPress={() => void handleSend()}
          >
            <Text style={styles.sendText}>{sending ? "…" : "SEND"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (threads.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>MESSAGES</Text>
        <View style={styles.emptyCard}>
          <Brackets />
          <Text style={styles.emptyText}>NO CONVERSATIONS YET</Text>
          <Text style={styles.emptySubtext}>
            Start a conversation on one of your projects.
          </Text>
          <TouchableOpacity style={[styles.sendBtn, { marginTop: 16 }]} onPress={() => void openCompose()}>
            <Text style={styles.sendText}>NEW CONVERSATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>MESSAGES</Text>
        <TouchableOpacity onPress={() => void openCompose()}>
          <Text style={styles.newLink}>NEW</Text>
        </TouchableOpacity>
      </View>

      {threads.map((thread) => {
        const unread = thread.unread_count ?? 0;
        const subject = thread.subject ?? thread.title ?? thread.projectName ?? "Thread";
        const lastMessage =
          typeof thread.last_message === "string"
            ? thread.last_message
            : thread.last_message?.content ?? "";
        const time = formatTimeAgo(
          thread.updated_at ?? thread.createdAt ?? thread.created_at ?? "",
        );

        return (
          <TouchableOpacity
            key={thread.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => setSelected(thread)}
          >
            <Brackets color={unread > 0 ? colors.primaryDark : BORDER} />

            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{subject.charAt(0)}</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  newLink: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primaryLight,
    letterSpacing: 2,
    marginBottom: 14,
  },
  cardSelected: {
    borderColor: colors.primaryDark,
  },
  backRow: {
    marginBottom: 8,
  },
  backText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.primaryLight,
    letterSpacing: 2,
  },
  threadBody: {
    flex: 1,
    marginBottom: 12,
  },
  messageBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 8,
  },
  messageBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  messageTime: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sendBtn: {
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.primaryLight,
    letterSpacing: 2,
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
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  subject: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: "#fff",
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
    fontSize: 12,
    color: colors.text,
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
