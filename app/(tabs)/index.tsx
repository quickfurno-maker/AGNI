import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AgniMark } from '@/components/AgniMark';
import { CommandButton } from '@/components/CommandButton';
import { CommandScreen } from '@/components/CommandScreen';
import { MetricTile } from '@/components/MetricTile';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { getOverview, listApprovals } from '@/lib/api';
import { fonts, palette, radius, type NeonTone } from '@/lib/theme';
import type { HealthState, OwnerSystem } from '@/types/owner';

const healthTone: Record<HealthState, NeonTone> = {
  HEALTHY: 'green',
  DEGRADED: 'fire',
  UNHEALTHY: 'danger',
  UNKNOWN: 'neutral',
};

const systemIcon: Record<OwnerSystem, keyof typeof Ionicons.glyphMap> = {
  QUICKFURNO: 'flame',
  JARVIS: 'hardware-chip',
  AGNI: 'flash',
};

function timeLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '--:--'
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const overview = useQuery({
    queryKey: ['owner-overview'],
    queryFn: getOverview,
    refetchInterval: 15_000,
  });
  const approvals = useQuery({
    queryKey: ['owner-approvals'],
    queryFn: listApprovals,
    refetchInterval: 15_000,
  });

  const data = overview.data;
  const healthy = data?.systems.filter((system) => system.state === 'HEALTHY').length ?? 0;
  const healthPct = data?.systems.length ? Math.round((healthy / data.systems.length) * 100) : 0;
  const refresh = async () => {
    await Promise.all([overview.refetch(), approvals.refetch()]);
  };

  return (
    <CommandScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefetching || approvals.isRefetching}
            onRefresh={() => void refresh()}
            tintColor={palette.blueBright}
          />
        }
      >
        <View style={styles.brandRow}>
          <AgniMark size={44} />
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>AGNI</Text>
            <Text style={styles.terminal}>OWNER COMMAND CENTER // v0.3</Text>
          </View>
          <StatusChip label="LIVE" tone={data?.overall === 'HEALTHY' ? 'green' : 'fire'} compact />
        </View>

        {overview.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.blueBright} />
            <Text style={styles.muted}>$ syncing owner telemetry...</Text>
          </View>
        ) : null}

        {overview.isError ? (
          <NeonPanel tone="danger">
            <Text style={styles.panelTitle}>OWNER GATEWAY OFFLINE</Text>
            <Text style={styles.muted}>No production action was attempted. Pull to retry.</Text>
          </NeonPanel>
        ) : null}

        {data ? (
          <>
            <NeonPanel tone={data.overall === 'HEALTHY' ? 'green' : 'fire'}>
              <View style={styles.healthRow}>
                <View style={styles.healthCopy}>
                  <Text style={styles.label}>OVERALL SYSTEM HEALTH</Text>
                  <Text style={[styles.healthHeadline, { color: data.overall === 'HEALTHY' ? palette.green : palette.lightning }]}>
                    {data.overall === 'HEALTHY' ? 'EXCELLENT' : data.overall}
                  </Text>
                  <Text style={styles.muted}>
                    {healthy}/{data.systems.length} systems healthy · observed {timeLabel(data.observedAt)}
                  </Text>
                </View>
                <View style={[styles.healthRing, { borderColor: data.overall === 'HEALTHY' ? palette.green : palette.lightning }]}>
                  <Text style={styles.healthPct}>{healthPct}%</Text>
                  <Text style={styles.ringLabel}>HEALTH</Text>
                </View>
              </View>
            </NeonPanel>

            <View style={styles.systemRow}>
              {data.systems.map((system) => (
                <Pressable
                  key={system.system}
                  onPress={() => router.push({ pathname: '/system/[system]', params: { system: system.system } })}
                  style={styles.systemCell}
                >
                  <View style={[styles.systemCard, { borderColor: system.state === 'HEALTHY' ? palette.blueBright : palette.lightning }]}>
                    <Ionicons
                      name={systemIcon[system.system]}
                      size={24}
                      color={system.system === 'QUICKFURNO' ? palette.fire : system.system === 'AGNI' ? palette.blueBright : palette.cyan}
                    />
                    <Text style={styles.systemName}>{system.label}</Text>
                    <StatusChip label={system.state} tone={healthTone[system.state]} compact />
                  </View>
                </Pressable>
              ))}
            </View>

            <NeonPanel tone="blue">
              <View style={styles.sectionHead}>
                <Text style={styles.panelTitle}>KEY METRICS // LIVE</Text>
                <Text style={styles.liveText}>● STREAM</Text>
              </View>
              {data.metrics.length === 0 ? (
                <Text style={styles.muted}>No bounded owner metrics are available yet.</Text>
              ) : (
                <View style={styles.metricGrid}>
                  {data.metrics.slice(0, 8).map((metric) => (
                    <MetricTile
                      key={metric.key}
                      label={metric.label}
                      value={metric.value}
                      tone={metric.attention ? 'fire' : 'blue'}
                      icon={metric.attention ? 'warning' : 'pulse'}
                    />
                  ))}
                </View>
              )}
            </NeonPanel>

            <NeonPanel tone={approvals.data?.length ? 'fire' : 'neutral'}>
              <View style={styles.sectionHead}>
                <Text style={styles.panelTitle}>PENDING APPROVALS</Text>
                <Pressable onPress={() => router.push('/(tabs)/approvals')}>
                  <Text style={styles.link}>VIEW ALL →</Text>
                </Pressable>
              </View>
              {approvals.isLoading ? <ActivityIndicator color={palette.lightning} size="small" /> : null}
              {approvals.data?.length === 0 ? <Text style={styles.good}>✓ NO OWNER DECISIONS WAITING</Text> : null}
              {approvals.data?.slice(0, 3).map((approval) => (
                <Pressable
                  key={approval.approvalId}
                  onPress={() => router.push('/(tabs)/approvals')}
                  style={styles.lineRow}
                >
                  <Ionicons name="flash" size={15} color={palette.lightning} />
                  <View style={styles.lineCopy}>
                    <Text style={styles.lineTitle}>{approval.title}</Text>
                    <Text style={styles.lineSub}>{approval.targetService} · {approval.risk}</Text>
                  </View>
                  <StatusChip label="REVIEW" tone="fire" compact />
                </Pressable>
              ))}
            </NeonPanel>

            <NeonPanel tone={data.attention.length ? 'danger' : 'neutral'}>
              <View style={styles.sectionHead}>
                <Text style={styles.panelTitle}>ATTENTION</Text>
                <Pressable onPress={() => router.push('/(tabs)/incidents')}>
                  <Text style={styles.link}>OPEN OPS →</Text>
                </Pressable>
              </View>
              {data.attention.length === 0 ? (
                <Text style={styles.good}>✓ NO OWNER ACTION REQUIRED</Text>
              ) : (
                data.attention.slice(0, 4).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      item.route?.startsWith('/incidents/')
                        ? router.push({ pathname: '/incident/[id]', params: { id: item.id } })
                        : router.push({ pathname: '/(tabs)/chat', params: { prompt: 'Explain ' + item.title } })
                    }
                    style={styles.lineRow}
                  >
                    <Ionicons name="warning" size={15} color={palette.fire} />
                    <View style={styles.lineCopy}>
                      <Text style={styles.lineTitle}>{item.title}</Text>
                      <Text style={styles.lineSub}>{item.summary}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color={palette.blueBright} />
                  </Pressable>
                ))
              )}
            </NeonPanel>

            <View style={styles.quickGrid}>
              <CommandButton
                label="ASK AGNI"
                icon="chatbubble-ellipses"
                tone="blue"
                style={styles.quick}
                onPress={() => router.push('/(tabs)/chat')}
              />
              <CommandButton
                label="SYSTEMS"
                icon="hardware-chip"
                tone="blue"
                style={styles.quick}
                onPress={() => router.push('/(tabs)/systems')}
              />
              <CommandButton
                label="MARKET"
                icon="analytics"
                tone="fire"
                style={styles.quick}
                onPress={() => router.push('/(tabs)/market')}
              />
              <CommandButton
                label="INCIDENTS"
                icon="warning"
                tone="fire"
                style={styles.quick}
                onPress={() => router.push('/(tabs)/incidents')}
              />
              <CommandButton
                label="APPROVALS"
                icon="finger-print"
                tone="green"
                style={styles.quick}
                onPress={() => router.push('/(tabs)/approvals')}
              />
            </View>

            <NeonPanel tone="neutral">
              <Text style={styles.panelTitle}>RECENT ACTIVITY</Text>
              {data.activity.slice(0, 5).map((item) => (
                <View key={item.eventId} style={styles.activityRow}>
                  <Text style={styles.activityTime}>{timeLabel(item.occurredAt)}</Text>
                  <View style={styles.lineCopy}>
                    <Text style={styles.lineTitle}>{item.title}</Text>
                    {item.summary ? <Text style={styles.lineSub}>{item.summary}</Text> : null}
                  </View>
                </View>
              ))}
            </NeonPanel>
          </>
        ) : null}
      </ScrollView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 112, gap: 11 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 2 },
  brandCopy: { flex: 1 },
  brand: { color: palette.text, fontFamily: fonts.mono, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  terminal: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 9, lineHeight: 14 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthCopy: { flex: 1, gap: 5 },
  label: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  healthHeadline: { fontFamily: fonts.mono, fontSize: 21, fontWeight: '900', letterSpacing: 1.5 },
  healthRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    backgroundColor: '#04111B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthPct: { color: palette.text, fontFamily: fonts.mono, fontSize: 18, fontWeight: '900' },
  ringLabel: { color: palette.muted, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800' },
  systemRow: { flexDirection: 'row', gap: 7 },
  systemCell: { flex: 1 },
  systemCard: {
    minHeight: 116,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: '#06111D',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  systemName: { color: palette.text, fontFamily: fonts.mono, fontSize: 10, fontWeight: '900' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  panelTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  liveText: { color: palette.green, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  link: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  good: { color: palette.green, fontFamily: fonts.mono, fontSize: 9, fontWeight: '900', paddingVertical: 4 },
  lineRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    paddingVertical: 7,
  },
  lineCopy: { flex: 1, gap: 2 },
  lineTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 9, fontWeight: '800' },
  lineSub: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quick: { width: '48.7%' },
  activityRow: { flexDirection: 'row', gap: 10, paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  activityTime: { width: 43, color: palette.cyan, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800' },
});
