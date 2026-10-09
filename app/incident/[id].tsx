import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CommandButton } from '@/components/CommandButton';
import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { getIncident } from '@/lib/api';
import { fonts, palette } from '@/lib/theme';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['owner-incident', id],
    queryFn: () => getIncident(id),
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });
  const incident = query.data;

  return (
    <CommandScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={18} color={palette.blueBright} />
          </Pressable>
          <View style={styles.headCopy}>
            <Text style={styles.title}>{'INCIDENT // ' + (id?.slice(-12) ?? '')}</Text>
            <Text style={styles.sub}>AGNI CORRELATED EVIDENCE VIEW</Text>
          </View>
          {incident ? <StatusChip label={incident.status} tone={incident.status === 'RESOLVED' ? 'green' : 'fire'} compact /> : null}
        </View>

        {query.isLoading ? <ActivityIndicator color={palette.lightning} /> : null}
        {query.isError ? <Text style={styles.error}>{'// INCIDENT LOAD FAILED CLOSED'}</Text> : null}

        {incident ? (
          <>
            <NeonPanel tone={incident.severity === 'CRITICAL' || incident.severity === 'EMERGENCY' ? 'danger' : 'fire'}>
              <View style={styles.severityRow}>
                <StatusChip label={incident.severity} tone={incident.severity === 'CRITICAL' || incident.severity === 'EMERGENCY' ? 'danger' : 'fire'} compact />
                <Text style={styles.target}>{incident.targetSystem + ' // ' + incident.targetService}</Text>
              </View>
              <Text style={styles.incidentTitle}>{incident.title}</Text>
              <Text style={styles.summary}>{incident.summary}</Text>
              <View style={styles.facts}>
                <Cell label="AFFECTED" value={String(incident.affectedCount ?? 0)} />
                <Cell label="CONFIDENCE" value={incident.confidence === undefined ? 'N/A' : Math.round(incident.confidence * 100) + '%'} />
                <Cell label="STATUS" value={incident.status} />
              </View>
            </NeonPanel>

            <View style={styles.actions}>
              <CommandButton
                label="ASK AGNI"
                icon="chatbubble-ellipses"
                tone="blue"
                style={styles.action}
                onPress={() => router.push({
                  pathname: '/(tabs)/chat',
                  params: { contextRef: 'incident:' + incident.incidentId, prompt: 'Explain this incident clearly for the owner.' },
                })}
              />
              {incident.status !== 'RESOLVED' ? (
                <>
                  <CommandButton
                    label="INVESTIGATE"
                    icon="pulse"
                    tone="blue"
                    style={styles.action}
                    onPress={() => router.push({
                      pathname: '/(tabs)/chat',
                      params: {
                        contextRef: 'incident:' + incident.incidentId,
                        prompt: 'Investigate this incident deeply and explain root cause, impact and evidence.',
                        intent: 'INVESTIGATE',
                      },
                    })}
                  />
                  <CommandButton
                    label="PREPARE FIX"
                    icon="flash"
                    tone="fire"
                    style={styles.action}
                    onPress={() => router.push({
                      pathname: '/(tabs)/chat',
                      params: {
                        contextRef: 'incident:' + incident.incidentId,
                        prompt: 'Prepare the safest bounded fix. Do not execute it.',
                        intent: 'PREPARE_FIX',
                      },
                    })}
                  />
                </>
              ) : null}
            </View>

            <NeonPanel tone="blue">
              <Text style={styles.panelTitle}>DIAGNOSIS</Text>
              <Row label="ROOT CAUSE" value={incident.rootCause ?? 'Still investigating'} />
              <Row label="IMPACT" value={incident.impact ?? 'Not yet quantified'} />
              <Row label="RECOMMENDATION" value={incident.recommendedAction ?? 'Continue monitoring'} />
            </NeonPanel>

            <NeonPanel tone="neutral">
              <Text style={styles.panelTitle}>EVIDENCE</Text>
              {incident.evidence.length === 0 ? <Text style={styles.muted}>No bounded evidence attached yet.</Text> : incident.evidence.map((evidence) => (
                <View key={evidence.ref} style={styles.evidence}>
                  <Text style={styles.evidenceType}>{evidence.type}</Text>
                  <Text style={styles.evidenceText}>{evidence.summary}</Text>
                </View>
              ))}
            </NeonPanel>

            <NeonPanel tone="neutral">
              <Text style={styles.panelTitle}>TIMELINE</Text>
              {incident.timeline.map((item, index) => (
                <View key={item.at + ':' + index} style={styles.timeline}>
                  <View style={styles.dot} />
                  <View style={styles.headCopy}>
                    <Text style={styles.timelineTitle}>{item.event}</Text>
                    {item.detail ? <Text style={styles.muted}>{item.detail}</Text> : null}
                    <Text style={styles.time}>{new Date(item.at).toLocaleString()}</Text>
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

function Cell({ label, value }: { label: string; value: string }) {
  return <View style={styles.cell}><Text style={styles.cellLabel}>{label}</Text><Text style={styles.cellValue}>{value}</Text></View>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 34, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  back: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: '#20517E', alignItems: 'center', justifyContent: 'center' },
  headCopy: { flex: 1 },
  title: { color: palette.text, fontFamily: fonts.mono, fontSize: 11, fontWeight: '900' },
  sub: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 7, marginTop: 2 },
  error: { color: palette.red, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  severityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  target: { flex: 1, textAlign: 'right', color: palette.cyan, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800' },
  incidentTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 16, fontWeight: '900', marginTop: 10 },
  summary: { color: palette.muted, fontFamily: fonts.mono, fontSize: 9, lineHeight: 14, marginTop: 5 },
  facts: { flexDirection: 'row', gap: 6, marginTop: 10 },
  cell: { flex: 1, minHeight: 52, borderWidth: 1, borderColor: '#263B50', borderRadius: 8, backgroundColor: '#06111D', padding: 6, justifyContent: 'center' },
  cellLabel: { color: palette.dim, fontFamily: fonts.mono, fontSize: 6, fontWeight: '800' },
  cellValue: { color: palette.lightning, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900', marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6 },
  action: { flex: 1 },
  panelTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 10, fontWeight: '900', marginBottom: 4 },
  row: { paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  rowLabel: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
  rowValue: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13, marginTop: 2 },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13 },
  evidence: { paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  evidenceType: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 7, fontWeight: '900' },
  evidenceText: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13, marginTop: 2 },
  timeline: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.lightning, marginTop: 4 },
  timelineTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  time: { color: palette.dim, fontFamily: fonts.mono, fontSize: 6, marginTop: 2 },
});
