import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AgniMark } from '@/components/AgniMark';
import { CommandScreen } from '@/components/CommandScreen';
import { MetricTile } from '@/components/MetricTile';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { getOverview, listApprovals, listIncidents } from '@/lib/api';
import { fonts, palette, type NeonTone } from '@/lib/theme';
import type { HealthState, OwnerSystem } from '@/types/owner';

const toneByHealth: Record<HealthState, NeonTone> = {
  HEALTHY: 'green',
  DEGRADED: 'fire',
  UNHEALTHY: 'danger',
  UNKNOWN: 'neutral',
};

const meta: Record<OwnerSystem, {
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  QUICKFURNO: {
    subtitle: 'MARKETPLACE + OPERATIONS',
    description: 'Leads, vendors, matching, payments, API and worker operations.',
    icon: 'flame',
    color: palette.fire,
  },
  JARVIS: {
    subtitle: 'AI + INTELLIGENCE',
    description: 'Riya, Anisha, Aarohi, WhatsApp, agents and model operations.',
    icon: 'hardware-chip',
    color: palette.cyan,
  },
  AGNI: {
    subtitle: 'ORCHESTRATION + CONTROL',
    description: 'Telemetry, security, AI-SRE, approvals, action broker and governance.',
    icon: 'flash',
    color: palette.lightning,
  },
};

export default function SystemsScreen() {
  const overview = useQuery({
    queryKey: ['owner-overview'],
    queryFn: getOverview,
    refetchInterval: 15_000,
  });
  const incidents = useQuery({
    queryKey: ['owner-incidents', 'all'],
    queryFn: () => listIncidents('all'),
    refetchInterval: 20_000,
  });
  const approvals = useQuery({
    queryKey: ['owner-approvals'],
    queryFn: listApprovals,
    refetchInterval: 15_000,
  });

  const refresh = async () => {
    await Promise.all([overview.refetch(), incidents.refetch(), approvals.refetch()]);
  };

  return (
    <CommandScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefetching || incidents.isRefetching}
            onRefresh={() => void refresh()}
            tintColor={palette.blueBright}
          />
        }
      >
        <View style={styles.header}>
          <AgniMark size={40} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>AGNI // SYSTEMS</Text>
            <Text style={styles.sub}>LIVE SYSTEM MATRIX // OWNER VIEW</Text>
          </View>
          <StatusChip
            label={(overview.data?.systems.filter((system) => system.state === 'HEALTHY').length ?? 0) + '/3 ONLINE'}
            tone="green"
            compact
          />
        </View>

        {overview.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.blueBright} />
            <Text style={styles.muted}>$ mapping live systems...</Text>
          </View>
        ) : null}

        {overview.data?.systems.map((system) => {
          const info = meta[system.system];
          const related = incidents.data?.filter((incident) => incident.targetSystem === system.system) ?? [];
          const openRelated = related.filter((incident) => incident.status !== 'RESOLVED');
          const qfMetrics = system.system === 'QUICKFURNO' ? overview.data.metrics.slice(0, 4) : [];
          const extraValue = system.system === 'AGNI'
            ? String(approvals.data?.length ?? 0)
            : String(openRelated.length);
          const extraLabel = system.system === 'AGNI' ? 'Pending approvals' : 'Open incidents';

          return (
            <NeonPanel key={system.system} tone={system.state === 'HEALTHY' ? 'blue' : 'fire'}>
              <View style={styles.systemHead}>
                <View style={[styles.icon, { borderColor: info.color + '88' }]}>
                  <Ionicons name={info.icon} size={25} color={info.color} />
                </View>
                <View style={styles.systemCopy}>
                  <Text style={styles.systemTitle}>{system.label}</Text>
                  <Text style={styles.systemSub}>{info.subtitle}</Text>
                </View>
                <StatusChip label={system.state} tone={toneByHealth[system.state]} compact />
              </View>

              <Text style={styles.description}>{info.description}</Text>

              {qfMetrics.length > 0 ? (
                <View style={styles.metrics}>
                  {qfMetrics.map((metric) => (
                    <MetricTile
                      key={metric.key}
                      label={metric.label}
                      value={metric.value}
                      tone={metric.attention ? 'fire' : 'blue'}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCell}>
                    <Text style={styles.summaryValue}>{system.state}</Text>
                    <Text style={styles.summaryLabel}>Health</Text>
                  </View>
                  <View style={styles.summaryCell}>
                    <Text style={[styles.summaryValue, openRelated.length > 0 && { color: palette.lightning }]}>{extraValue}</Text>
                    <Text style={styles.summaryLabel}>{extraLabel}</Text>
                  </View>
                  <View style={styles.summaryCell}>
                    <Text style={styles.summaryValue}>LIVE</Text>
                    <Text style={styles.summaryLabel}>Telemetry</Text>
                  </View>
                </View>
              )}

              <View style={styles.actions}>
                <Pressable
                  style={styles.action}
                  onPress={() => router.push({ pathname: '/system/[system]', params: { system: system.system } })}
                >
                  <Ionicons name="analytics" size={13} color={palette.blueBright} />
                  <Text style={styles.actionText}>VIEW DETAILS</Text>
                </Pressable>
                <Pressable
                  style={styles.action}
                  onPress={() => router.push({
                    pathname: '/(tabs)/chat',
                    params: { prompt: 'Check ' + system.label + ' health and explain anything abnormal.' },
                  })}
                >
                  <Ionicons name="terminal" size={13} color={palette.cyan} />
                  <Text style={styles.actionText}>ASK AGNI</Text>
                </Pressable>
                <Pressable
                  style={[styles.action, styles.manage]}
                  onPress={() => router.push('/(tabs)/incidents')}
                >
                  <Ionicons name="flash" size={13} color={palette.lightning} />
                  <Text style={styles.actionText}>INCIDENTS</Text>
                </Pressable>
              </View>
            </NeonPanel>
          );
        })}

        <NeonPanel tone="neutral">
          <View style={styles.sectionHead}>
            <Text style={styles.panelTitle}>SYSTEM CONTROL SURFACES</Text>
            <Text style={styles.stream}>● LIVE</Text>
          </View>
          <View style={styles.controlGrid}>
            {[
              ['Telemetry', 'pulse'],
              ['Security', 'shield-checkmark'],
              ['Approvals', 'finger-print'],
              ['Automation', 'flash'],
            ].map(([label, icon]) => (
              <View key={label} style={styles.controlTile}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={label === 'Automation' ? palette.lightning : palette.blueBright} />
                <Text style={styles.controlTitle}>{label}</Text>
                <Text style={styles.controlState}>BOUND</Text>
              </View>
            ))}
          </View>
          <Text style={styles.muted}>
            $ drill-downs expose owner-safe telemetry and route deeper reasoning through AGNI only when required.
          </Text>
        </NeonPanel>
      </ScrollView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 112, gap: 11 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 4, paddingBottom: 3 },
  headerCopy: { flex: 1 },
  title: { color: palette.text, fontFamily: fonts.mono, fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },
  sub: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 9 },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13 },
  systemHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: 13,
    backgroundColor: '#061421',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemCopy: { flex: 1 },
  systemTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 16, fontWeight: '900' },
  systemSub: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900', letterSpacing: 0.7, marginTop: 2 },
  description: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13, marginTop: 9 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  summaryGrid: { flexDirection: 'row', gap: 7, marginTop: 10 },
  summaryCell: {
    flex: 1,
    minHeight: 62,
    borderWidth: 1,
    borderColor: '#17416A',
    backgroundColor: '#06111D',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
  },
  summaryValue: { color: palette.green, fontFamily: fonts.mono, fontSize: 12, fontWeight: '900' },
  summaryLabel: { color: palette.muted, fontFamily: fonts.mono, fontSize: 7, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  action: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#20588E',
    borderRadius: 9,
    backgroundColor: '#061522',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  manage: { borderColor: '#806A16' },
  actionText: { color: palette.text, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  stream: { color: palette.green, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
  controlGrid: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  controlTile: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#17416A',
    borderRadius: 10,
    backgroundColor: '#06111D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  controlTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800' },
  controlState: { color: palette.green, fontFamily: fonts.mono, fontSize: 6, fontWeight: '900' },
});
