import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { listIncidents } from '@/lib/api';
import { palette, radius } from '@/lib/theme';
import type { IncidentSeverity } from '@/types/owner';

const severityColor: Record<IncidentSeverity, string> = {
  INFO: palette.blue,
  WARNING: palette.yellow,
  CRITICAL: palette.red,
  EMERGENCY: '#FF2F45',
};

export default function IncidentsScreen() {
  const query = useQuery({
    queryKey: ['owner-incidents'],
    queryFn: listIncidents,
    refetchInterval: 20_000,
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>LIVE OPERATIONS</Text>
          <Text style={styles.title}>Incidents</Text>
          <Text style={styles.subtitle}>Correlated platform problems, not raw alerts.</Text>
        </View>

        {query.isLoading ? <ActivityIndicator color={palette.accent} /> : null}
        {query.isError ? <Text style={styles.error}>Could not load incidents.</Text> : null}

        {query.data?.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.okDot} />
            <Text style={styles.emptyTitle}>No open incidents</Text>
            <Text style={styles.subtitle}>AGNI will surface new incidents here and notify Telegram.</Text>
          </View>
        ) : null}

        {query.data?.map((incident) => (
          <Pressable
            key={incident.incidentId}
            onPress={() => router.push({ pathname: '/incident/[id]', params: { id: incident.incidentId } })}
            style={styles.card}
          >
            <View style={styles.cardTop}>
              <View style={[styles.severity, { backgroundColor: severityColor[incident.severity] }]} />
              <Text style={styles.cardTitle}>{incident.title}</Text>
              <Text style={styles.severityText}>{incident.severity}</Text>
            </View>
            <Text style={styles.cardSummary}>{incident.summary}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>{incident.targetService}</Text>
              {incident.affectedCount !== undefined ? (
                <Text style={styles.metaText}>{incident.affectedCount} affected</Text>
              ) : null}
              {incident.confidence !== undefined ? (
                <Text style={styles.metaText}>{Math.round(incident.confidence * 100)}% confidence</Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, gap: 12, paddingBottom: 28 },
  header: { marginBottom: 8, gap: 4 },
  eyebrow: { color: palette.accent, fontSize: 10, letterSpacing: 1.5, fontWeight: '900' },
  title: { color: palette.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  error: { color: palette.red },
  empty: {
    marginTop: 50,
    alignItems: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  okDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: palette.green },
  emptyTitle: { color: palette.text, fontSize: 16, fontWeight: '900' },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 15,
    gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  severity: { width: 8, height: 8, borderRadius: 999 },
  cardTitle: { flex: 1, color: palette.text, fontSize: 15, fontWeight: '900' },
  severityText: { color: palette.muted, fontSize: 9, fontWeight: '900' },
  cardSummary: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaText: {
    color: palette.muted,
    backgroundColor: palette.surface2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: '700',
  },
});
