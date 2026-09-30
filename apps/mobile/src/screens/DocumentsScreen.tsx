import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { listProjects, listFiles } from "../api/client";

export default function DocumentsScreen() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  // Without this a failed request renders as "No documents found", which tells
  // the client their documents are missing rather than that we could not ask.
  const [loadError, setLoadError] = useState("");

  /**
   * `isCancelled` is supplied by the effect so an unmounted screen stops
   * writing state, while still letting the RETRY button call this directly.
   */
  const fetchData = useCallback(async (isCancelled: () => boolean = () => false) => {
    try {
      const res = await listProjects();
      if (isCancelled()) return;

      const docs: any[] = [];
      for (const project of res.items ?? []) {
        try {
          const filesRes = await listFiles(project.id);
          if (isCancelled()) return;
          const files = Array.isArray(filesRes)
            ? filesRes
            : ((filesRes as any).items ?? []);
          for (const f of files) {
            docs.push({
              name: f.file_name ?? f.fileName ?? f.filename ?? f.name ?? "File",
              type: f.mime_type ?? f.mimeType ?? "File",
              date: f.created_at ?? f.createdAt ?? f.uploaded_at ?? project.created_at ?? "",
              url: f.url ?? f.file_url ?? f.fileURL,
              project: project.title ?? project.name,
            });
          }
        } catch {
          if (project.specification_id || project.specification) {
            docs.push({
              name: `${project.title ?? project.name} Specification`,
              type: "Specification",
              date: project.updated_at ?? project.created_at ?? "",
            });
          }
          if (project.attachments && Array.isArray(project.attachments)) {
            for (const att of project.attachments) {
              docs.push({
                name: att.fileName ?? att.file_name ?? att.name ?? att.filename ?? "Attachment",
                type: att.type ?? "Attachment",
                date: att.created_at ?? project.created_at ?? "",
                url: att.file_url ?? att.fileURL ?? att.url,
              });
            }
          }
        }
      }

      if (isCancelled()) return;
      setDocuments(docs);
      setLoadError("");
    } catch {
      if (isCancelled()) return;
      setDocuments([]);
      setLoadError("Could not load your documents. Check your connection and try again.");
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchData(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <View style={{ width: "60%", height: 15, backgroundColor: colors.surfaceLight, borderRadius: 2, marginBottom: 6 }} />
                <View style={{ width: 80, height: 12, backgroundColor: colors.surfaceLight, borderRadius: 2 }} />
              </View>
              <View style={{ width: 70, height: 22, backgroundColor: colors.surfaceLight, borderRadius: 6 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity
          onPress={() => { setLoading(true); void fetchData(); }}
          accessibilityRole="button"
          accessibilityLabel="Retry loading documents"
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (documents.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No documents found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {documents.map((doc, i) => (
        <TouchableOpacity
          key={`${doc.name}-${i}`}
          style={styles.card}
          activeOpacity={doc.url ? 0.7 : 1}
          onPress={() => {
            if (doc.url) void Linking.openURL(doc.url);
          }}
        >
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{doc.name}</Text>
              <Text style={styles.date}>
                {[doc.project, formatDate(doc.date)].filter(Boolean).join(" · ")}
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{doc.type}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  errorText: { color: colors.error, textAlign: "center", fontFamily: fonts.regular, marginBottom: 16 },
  retryButton: { borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.primary, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  info: { flex: 1, paddingRight: 8 },
  name: { fontSize: 15, fontWeight: "600", color: colors.text },
  date: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  typeBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 11, color: colors.textSecondary },
});
