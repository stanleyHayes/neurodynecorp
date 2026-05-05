import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { BORDER, cornerBrackets } from "../theme/styles";
import { listInvoices } from "../api/client";

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

function SkeletonBilling() {
  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.summaryCell}>
            <SkeletonBlock width={80} height={10} style={{ marginBottom: 8 }} />
            <SkeletonBlock width={100} height={24} />
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>INVOICES</Text>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock width={70} height={12} style={{ marginBottom: 8 }} />
          <SkeletonBlock
            width="70%"
            height={13}
            style={{ marginBottom: 10 }}
          />
          <SkeletonBlock width={90} height={16} />
        </View>
      ))}
    </View>
  );
}

/* ── date formatting ─────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  } catch {
    return dateStr;
  }
}

/* ── main screen ─────────────────────────────────────────────── */

export default function BillingScreen() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await listInvoices();
        if (!cancelled) setInvoices(res.items);
      } catch {
        // keep empty on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid" || inv.status === "Paid")
    .reduce((sum, inv) => sum + (inv.total ?? inv.amount ?? 0), 0);
  const totalOutstanding = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "Pending")
    .reduce((sum, inv) => sum + (inv.total ?? inv.amount ?? 0), 0);

  if (loading) return <SkeletonBilling />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Summary Row ──────────────────────────────────────── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <Brackets />
          <Text style={styles.summaryLabel}>TOTAL PAID</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            ${totalPaid.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryCell}>
          <Brackets />
          <Text style={styles.summaryLabel}>OUTSTANDING</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            ${totalOutstanding.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* ── Invoices ─────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>INVOICES</Text>

      {invoices.map((invoice) => {
        const status = (invoice.status ?? "").toLowerCase();
        const isPaid = status === "paid";
        const badgeColor = isPaid ? colors.success : colors.warning;
        const invoiceId = invoice.invoice_number ?? invoice.id ?? "";
        const amount = invoice.total ?? invoice.amount ?? 0;
        const description = invoice.description ?? invoice.line_items?.[0]?.description ?? "";
        const date = formatDate(isPaid ? (invoice.paid_at ?? invoice.created_at ?? "") : (invoice.due_date ?? invoice.created_at ?? ""));

        return (
          <View key={invoice.id} style={styles.card}>
            <Brackets />

            <View style={styles.cardHeader}>
              <Text style={styles.invoiceId}>{invoiceId}</Text>
              <View style={[styles.statusChip, { borderColor: badgeColor }]}>
                <Text style={[styles.statusChipText, { color: badgeColor }]}>
                  {(invoice.status ?? "").toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{description}</Text>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.amount}>
                  ${amount.toLocaleString()}
                </Text>
                <Text style={styles.date}>{date}</Text>
              </View>
              {!isPaid && (
                <TouchableOpacity
                  style={styles.payButton}
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      "Payment",
                      `Processing payment for ${invoiceId}`,
                    )
                  }
                >
                  <Text style={styles.payButtonText}>PAY NOW</Text>
                </TouchableOpacity>
              )}
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
  summaryRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
  },
  summaryCell: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.surface,
    padding: 18,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: 24,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceId: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primaryLight,
    letterSpacing: 1.5,
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
  description: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amount: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 3,
  },
  payButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  payButtonText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 2,
  },
});
