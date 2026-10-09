import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CommandButton } from '@/components/CommandButton';
import { CommandScreen } from '@/components/CommandScreen';
import { MetricTile } from '@/components/MetricTile';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { getOverview, listIncidents } from '@/lib/api';
import { fonts, palette, type NeonTone } from '@/lib/theme';
import type { HealthState, OwnerSystem } from '@/types/owner';

const tones: Record<HealthState, NeonTone> = { HEALTHY: 'green', DEGRADED: 'fire', UNHEALTHY: 'danger', UNKNOWN: 'neutral' };
const valid = new Set<OwnerSystem>(['QUICKFURNO', 'JARVIS', 'AGNI']);

export default function SystemDetailScreen() {
  const params = useLocalSearchParams<{ system?: string }>();
  const system = valid.has(params.system as OwnerSystem) ? params.system as OwnerSystem : 'AGNI';
  const overview = useQuery({ queryKey: ['owner-overview'], queryFn: getOverview, refetchInterval: 15_000 });
  const incidents = useQuery({ queryKey: ['owner-incidents', 'all'], queryFn: () => listIncidents('all'), refetchInterval: 20_000 });
  const state = overview.data?.systems.find((item) => item.system === system);
  const related = incidents.data?.filter((item) => item.targetSystem === system) ?? [];
  const open = related.filter((item) => item.status !== 'RESOLVED');
  const metrics = system === 'QUICKFURNO' ? overview.data?.metrics ?? [] : [];

  return (
    <CommandScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={18} color={palette.blueBright} />
          </Pressable>
          <View style={styles.headCopy}>
            <Text style={styles.title}>{system + ' // SYSTEM DETAIL'}</Text>
            <Text style={styles.sub}>OWNER-SAFE LIVE TELEMETRY</Text>
          </View>
          {state ? <StatusChip label={state.state} tone={tones[state.state]} compact /> : null}
        </View>

        <NeonPanel tone={state?.state === 'HEALTHY' ? 'blue' : 'fire'}>
          <View style={styles.hero}>
            <Ionicons
              name={system === 'QUICKFURNO' ? 'flame' : system === 'JARVIS' ? 'hardware-chip' : 'flash'}
              size={34}
              color={system === 'QUICKFURNO' ? palette.fire : system === 'JARVIS' ? palette.cyan : palette.lightning}
            />
            <View style={styles.headCopy}>
              <Text style={styles.heroTitle}>{system}</Text>
              <Text style={styles.muted}>{state?.summary ?? 'Live owner control surface'}</Text>
            </View>
          </View>
          <View style={styles.summary}>
            <Cell value={state?.state ?? 'UNKNOWN'} label="HEALTH" />
            <Cell value={String(open.length)} label="OPEN INCIDENTS" attention={open.length > 0} />
            <Cell value={String(related.length)} label="INCIDENT HISTORY" />
          </View>
        </NeonPanel>

        {metrics.length > 0 ? (
          <NeonPanel tone="blue">
            <Text style={styles.panelTitle}>LIVE METRICS</Text>
            <View style={styles.metrics}>
              {metrics.slice(0, 8).map((metric) => (
                <MetricTile key={metric.key} label={metric.label} value={metric.value} tone={metric.attention ? 'fire' : 'blue'} />
              ))}
            </View>
          </NeonPanel>
        ) : null}

        <NeonPanel tone={open.length ? 'fire' : 'green'}>
          <View style={styles.sectionHead}>
            <Text style={styles.panelTitle}>INCIDENTS</Text>
            <Text style={styles.stream}>{open.length} OPEN</Text>
          </View>
          {related.length === 0 ? <Text style={styles.good}>✓ NO RECORDED INCIDENTS</Text> : related.slice(0, 8).map((incident) => (
            <Pressable key={incident.incidentId} onPress={() => router.push({ pathname: '/incident/[id]', params: { id: incident.incidentId } })} style={styles.row}>
              <Ionicons name={incident.status === 'RESOLVED' ? 'checkmark-circle' : 'warning'} size={14} color={incident.status === 'RESOLVED' ? palette.green : palette.fire} />
              <View style={styles.headCopy}>
                <Text style={styles.rowTitle}>{incident.title}</Text>
                <Text style={styles.muted}>{incident.targetService} · {incident.status}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={palette.blueBright} />
            </Pressable>
          ))}
        </NeonPanel>

        <View style={styles.actions}>
          <CommandButton label="ASK AGNI" icon="chatbubble-ellipses" tone="blue" style={styles.action} onPress={() => router.push({ pathname: '/(tabs)/chat', params: { prompt: 'Check ' + system + ' and summarize current health and risks.' } })} />
          <CommandButton label="DIAGNOSE" icon="pulse" tone="fire" style={styles.action} onPress={() => router.push({ pathname: '/(tabs)/chat', params: { prompt: 'Diagnose ' + system + ' using relevant live telemetry only.', intent: 'INVESTIGATE' } })} />
        </View>

        <NeonPanel tone="neutral">
          <Text style={styles.console}>owner@agni:~$ system inspect --target={system.toLowerCase()} --safe</Text>
          <Text style={styles.muted}>Credentials, unrestricted shell and raw production mutation are intentionally not exposed.</Text>
        </NeonPanel>
      </ScrollView>
    </CommandScreen>
  );
}

function Cell({ value, label, attention = false }: { value: string; label: string; attention?: boolean }) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.cellValue, attention && { color: palette.lightning }]}>{value}</Text>
      <Text style={styles.cellLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 34, gap: 11 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  back: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: '#20517E', alignItems: 'center', justifyContent: 'center' },
  headCopy: { flex: 1 },
  title: { color: palette.text, fontFamily: fonts.mono, fontSize: 12, fontWeight: '900' },
  sub: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800', marginTop: 2 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  heroTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 18, fontWeight: '900' },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13 },
  summary: { flexDirection: 'row', gap: 7, marginTop: 12 },
  cell: { flex: 1, minHeight: 64, borderWidth: 1, borderColor: '#1C4368', borderRadius: 9, backgroundColor: '#06111D', padding: 7, justifyContent: 'center' },
  cellValue: { color: palette.green, fontFamily: fonts.mono, fontSize: 11, fontWeight: '900' },
  cellLabel: { color: palette.dim, fontFamily: fonts.mono, fontSize: 6, fontWeight: '800', marginTop: 3 },
  panelTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 10, fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stream: { color: palette.lightning, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
  good: { color: palette.green, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900', paddingVertical: 6 },
  row: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  rowTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1 },
  console: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800', marginBottom: 6 },
});
