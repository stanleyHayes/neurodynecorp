import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { listProjects } from "../api/client";

export default function DocumentsScreen() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await listProjects();
        if (cancelled) return;

        const docs: any[] = [];
        for (const project of res.items) {
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
                name: att.name ?? att.filename ?? "Attachment",
                type: att.type ?? "Attachment",
                date: att.created_at ?? project.created_at ?? "",
              });
            }
          }
        }

        setDocuments(docs);
      } catch {
        // keep empty on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

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
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{doc.name}</Text>
              <Text style={styles.date}>{formatDate(doc.date)}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{doc.type}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: colors.text },
  date: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  typeBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 11, color: colors.textSecondary },
});
