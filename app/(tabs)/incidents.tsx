import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AgniMark } from '@/components/AgniMark';
import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { listIncidents } from '@/lib/api';
import { fonts, palette, radius, type NeonTone } from '@/lib/theme';
import type { IncidentSeverity } from '@/types/owner';

type IncidentTab = 'open' | 'resolved' | 'all';

const tone: Record<IncidentSeverity, NeonTone> = {
  INFO: 'blue',
  WARNING: 'fire',
  CRITICAL: 'danger',
  EMERGENCY: 'danger',
};

const label: Record<IncidentSeverity, string> = {
  INFO: 'INFO',
  WARNING: 'HIGH',
  CRITICAL: 'CRITICAL',
  EMERGENCY: 'EMERGENCY',
};

function age(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000));
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  return Math.floor(hours / 24) + 'd ago';
}

export default function IncidentsScreen() {
  const [tab, setTab] = useState<IncidentTab>('open');
  const query = useQuery({
    queryKey: ['owner-incidents', tab],
    queryFn: () => listIncidents(tab),
    refetchInterval: 20_000,
  });

  return (
    <CommandScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={palette.blueBright}
          />
        }
      >
        <View style={styles.header}>
          <AgniMark size={40} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>AGNI // INCIDENTS</Text>
            <Text style={styles.sub}>DETECT // INVESTIGATE // RESOLVE // VERIFY</Text>
          </View>
          <StatusChip label={(query.data?.length ?? 0) + ' ' + tab.toUpperCase()} tone={tab === 'open' && query.data?.length ? 'fire' : 'blue'} compact />
        </View>

        <View style={styles.tabs}>
          {([
            ['open', 'ACTIVE'],
            ['resolved', 'RESOLVED'],
            ['all', 'ALL'],
          ] as const).map(([value, text]) => (
            <Pressable
              key={value}
              onPress={() => setTab(value)}
              style={[styles.tab, tab === value && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === value && styles.tabTextActive]}>{text}</Text>
            </Pressable>
          ))}
        </View>

        {query.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.lightning} />
            <Text style={styles.muted}>$ correlating incidents...</Text>
          </View>
        ) : null}

        {query.isError ? (
          <NeonPanel tone="danger">
            <Text style={styles.error}>{'// INCIDENT FEED UNAVAILABLE. NO ACTION EXECUTED.'}</Text>
          </NeonPanel>
        ) : null}

        {query.data?.length === 0 ? (
          <NeonPanel tone="green">
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle" size={28} color={palette.green} />
              <Text style={styles.emptyTitle}>{tab === 'resolved' ? 'NO RESOLVED INCIDENTS IN VIEW' : 'NO ACTIVE INCIDENTS'}</Text>
              <Text style={styles.muted}>AGNI will surface correlated operational problems here.</Text>
            </View>
          </NeonPanel>
        ) : null}

        {query.data?.map((incident) => (
          <NeonPanel key={incident.incidentId} tone={tone[incident.severity]}>
            <View style={styles.cardTop}>
              <StatusChip label={label[incident.severity]} tone={tone[incident.severity]} compact />
              <Text style={styles.incidentId}># {incident.incidentId.slice(-10)}</Text>
              <Text style={styles.age}>{age(incident.firstObservedAt)}</Text>
            </View>

            <Text style={styles.cardTitle}>{incident.title}</Text>
            <Text style={styles.summary}>{incident.summary}</Text>

            <View style={styles.factRow}>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>SYSTEM</Text>
                <Text style={styles.factValue}>{incident.targetSystem}</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>SERVICE</Text>
                <Text style={styles.factValue}>{incident.targetService}</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>AFFECTED</Text>
                <Text style={styles.factValue}>{incident.affectedCount ?? 0}</Text>
              </View>
            </View>

            {incident.confidence !== undefined ? (
              <View style={styles.confidence}>
                <Text style={styles.confidenceLabel}>AGNI CONFIDENCE</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: (Math.max(4, Math.round(incident.confidence * 100)) + '%') as `${number}%` }]} />
                </View>
                <Text style={styles.confidenceValue}>{Math.round(incident.confidence * 100)}%</Text>
              </View>
            ) : null}

            <View style={styles.statusLine}>
              <Ionicons
                name={incident.status === 'RESOLVED' ? 'checkmark-circle' : 'pulse'}
                size={13}
                color={incident.status === 'RESOLVED' ? palette.green : palette.lightning}
              />
              <Text style={styles.statusText}>{incident.status}</Text>
              {incident.recommendedAction ? <Text style={styles.recommend}>{'// ' + incident.recommendedAction}</Text> : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.action}
                onPress={() => router.push({ pathname: '/incident/[id]', params: { id: incident.incidentId } })}
              >
                <Text style={styles.actionText}>VIEW DETAILS</Text>
              </Pressable>
              {incident.status !== 'RESOLVED' ? (
                <>
                  <Pressable
                    style={[styles.action, styles.investigate]}
                    onPress={() => router.push({
                      pathname: '/(tabs)/chat',
                      params: {
                        contextRef: 'incident:' + incident.incidentId,
                        prompt: 'Investigate this incident deeply and explain root cause, impact and evidence.',
                        intent: 'INVESTIGATE',
                      },
                    })}
                  >
                    <Ionicons name="pulse" size={12} color={palette.blueBright} />
                    <Text style={styles.actionText}>INVESTIGATE</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.action, styles.prepare]}
                    onPress={() => router.push({
                      pathname: '/(tabs)/chat',
                      params: {
                        contextRef: 'incident:' + incident.incidentId,
                        prompt: 'Prepare the safest bounded fix for this incident. Do not execute it.',
                        intent: 'PREPARE_FIX',
                      },
                    })}
                  >
                    <Ionicons name="flash" size={12} color={palette.lightning} />
                    <Text style={styles.actionText}>PREPARE FIX</Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </NeonPanel>
        ))}
      </ScrollView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 112, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 4, paddingBottom: 2 },
  headerCopy: { flex: 1 },
  title: { color: palette.text, fontFamily: fonts.mono, fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },
  sub: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800', letterSpacing: 0.7, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: {
    flex: 1,
    minHeight: 37,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#06111B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { borderColor: palette.blueBright, backgroundColor: '#0A2342' },
  tabText: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  tabTextActive: { color: palette.blueBright },
  loading: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 8 },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13 },
  error: { color: palette.red, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  empty: { alignItems: 'center', gap: 7, paddingVertical: 14 },
  emptyTitle: { color: palette.green, fontFamily: fonts.mono, fontSize: 10, fontWeight: '900' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  incidentId: { flex: 1, color: palette.cyan, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800' },
  age: { color: palette.muted, fontFamily: fonts.mono, fontSize: 7 },
  cardTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 14, fontWeight: '900', marginTop: 9 },
  summary: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13, marginTop: 5 },
  factRow: { flexDirection: 'row', gap: 6, marginTop: 9 },
  fact: {
    flex: 1,
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#23364B',
    borderRadius: 8,
    backgroundColor: '#06111B',
    padding: 6,
    justifyContent: 'center',
  },
  factLabel: { color: palette.dim, fontFamily: fonts.mono, fontSize: 6, fontWeight: '900' },
  factValue: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900', marginTop: 3 },
  confidence: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  confidenceLabel: { color: palette.dim, fontFamily: fonts.mono, fontSize: 6, fontWeight: '900' },
  track: { flex: 1, height: 4, backgroundColor: '#182536', borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: palette.lightning, borderRadius: 2 },
  confidenceValue: { color: palette.lightning, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
  statusText: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  recommend: { flex: 1, color: palette.lightning, fontFamily: fonts.mono, fontSize: 7, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  action: {
    flex: 1,
    minHeight: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#24517B',
    backgroundColor: '#06131F',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  investigate: { borderColor: palette.blueBright },
  prepare: { borderColor: '#88721D' },
  actionText: { color: palette.text, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
});
