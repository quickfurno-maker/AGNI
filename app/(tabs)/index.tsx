import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HealthPill } from '@/components/HealthPill';
import { SectionCard } from '@/components/SectionCard';
import { getOverview } from '@/lib/api';
import { palette, radius } from '@/lib/theme';

function timeLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const overview = useQuery({
    queryKey: ['owner-overview'],
    queryFn: getOverview,
    refetchInterval: 15_000,
  });

  const data = overview.data;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefetching}
            onRefresh={() => void overview.refetch()}
            tintColor={palette.accent}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>AGNI COMMAND</Text>
            <Text style={styles.title}>Owner Intelligence</Text>
          </View>
          <View style={styles.live}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {!data && overview.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.muted}>Loading live owner state…</Text>
          </View>
        ) : null}

        {overview.isError ? (
          <SectionCard title="Owner Gateway unavailable" subtitle="No production-changing action was attempted.">
            <Text style={styles.error}>Pull to retry or ask AGNI after connectivity returns.</Text>
          </SectionCard>
        ) : null}

        {data ? (
          <>
            <View style={styles.statusRow}>
              {data.systems.map((system) => (
                <HealthPill key={system.system} label={system.label} state={system.state} />
              ))}
            </View>

            <Pressable
              onPress={() => router.push({ pathname: '/(tabs)/chat', params: { prompt: 'What needs my attention right now?' } })}
              style={styles.askCard}
            >
              <View style={styles.askIcon}>
                <Ionicons name="sparkles" size={20} color={palette.bg} />
              </View>
              <View style={styles.askText}>
                <Text style={styles.askTitle}>Ask the whole system</Text>
                <Text style={styles.askBody}>QuickFurno + Jarvis + AGNI + live evidence</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={palette.accent} />
            </Pressable>

            <SectionCard
              title="Live pulse"
              subtitle={`Observed ${timeLabel(data.observedAt)} · only owner-level signals`}
            >
              <View style={styles.metricGrid}>
                {data.metrics.slice(0, 8).map((metric) => (
                  <View key={metric.key} style={styles.metric}>
                    <Text style={[styles.metricValue, metric.attention && { color: palette.yellow }]}>
                      {metric.value}
                    </Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </View>
                ))}
              </View>
            </SectionCard>

            <SectionCard title="Needs attention" subtitle="Incidents and business exceptions AGNI thinks matter.">
              {data.attention.length === 0 ? (
                <Text style={styles.good}>No owner action required.</Text>
              ) : (
                data.attention.slice(0, 5).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      item.route?.startsWith('/incidents/')
                        ? router.push(item.route as never)
                        : router.push({ pathname: '/(tabs)/chat', params: { prompt: `Explain attention item ${item.id}: ${item.title}` } })
                    }
                    style={styles.row}
                  >
                    <View style={styles.attentionDot} />
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowText}>{item.summary}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                  </Pressable>
                ))
              )}
            </SectionCard>

            <SectionCard title="Live activity" subtitle="Meaningful platform events, not raw logs.">
              {data.activity.slice(0, 8).map((item) => (
                <View key={item.eventId} style={styles.activity}>
                  <Text style={styles.activityTime}>{timeLabel(item.occurredAt)}</Text>
                  <View style={styles.activityBody}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    {item.summary ? <Text style={styles.rowText}>{item.summary}</Text> : null}
                  </View>
                </View>
              ))}
            </SectionCard>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, paddingBottom: 28, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  eyebrow: { color: palette.accent, fontSize: 10, letterSpacing: 1.6, fontWeight: '900' },
  title: { color: palette.text, fontSize: 25, fontWeight: '900', marginTop: 3 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: palette.green },
  liveText: { color: palette.green, fontSize: 10, letterSpacing: 1.2, fontWeight: '900' },
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: palette.muted },
  error: { color: palette.red, lineHeight: 20 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  askCard: {
    minHeight: 82,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#5D4527',
    backgroundColor: palette.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  askIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askText: { flex: 1, gap: 3 },
  askTitle: { color: palette.text, fontWeight: '900', fontSize: 15 },
  askBody: { color: palette.muted, fontSize: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: {
    width: '47.8%',
    minHeight: 78,
    borderRadius: radius.md,
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    justifyContent: 'center',
  },
  metricValue: { color: palette.text, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: palette.muted, fontSize: 11, marginTop: 4 },
  good: { color: palette.green, fontSize: 14, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  attentionDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: palette.yellow },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { color: palette.text, fontSize: 13, fontWeight: '800' },
  rowText: { color: palette.muted, fontSize: 12, lineHeight: 17 },
  activity: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  activityTime: { color: palette.muted, width: 48, fontSize: 11, fontWeight: '700' },
  activityBody: { flex: 1, gap: 3 },
});
