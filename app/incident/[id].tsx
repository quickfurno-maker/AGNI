import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getIncident } from '@/lib/api';
import { palette, radius } from '@/lib/theme';

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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={19} color={palette.text} />
          <Text style={styles.backText}>Incidents</Text>
        </Pressable>

        {query.isLoading ? <ActivityIndicator color={palette.accent} /> : null}
        {query.isError ? <Text style={styles.error}>Could not load incident.</Text> : null}

        {incident ? (
          <>
            <Text style={styles.eyebrow}>{incident.severity} · {incident.status}</Text>
            <Text style={styles.title}>{incident.title}</Text>
            <Text style={styles.summary}>{incident.summary}</Text>

            <View style={styles.actions}>
              <Pressable
                style={styles.secondary}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/chat',
                    params: {
                      contextRef: `incident:${incident.incidentId}`,
                      prompt: 'Investigate this incident deeply and explain the root cause, impact and evidence.',
                    },
                  })
                }
              >
                <Text style={styles.secondaryText}>Investigate</Text>
              </Pressable>
              <Pressable
                style={styles.primary}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/chat',
                    params: {
                      contextRef: `incident:${incident.incidentId}`,
                      prompt: 'Prepare the safest bounded fix for this incident. Do not execute it.',
                    },
                  })
                }
              >
                <Text style={styles.primaryText}>Prepare Fix</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Diagnosis</Text>
              <Text style={styles.line}>Root cause · {incident.rootCause ?? 'Still investigating'}</Text>
              <Text style={styles.line}>Impact · {incident.impact ?? 'Not yet quantified'}</Text>
              {incident.confidence !== undefined ? (
                <Text style={styles.line}>Confidence · {Math.round(incident.confidence * 100)}%</Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Evidence</Text>
              {incident.evidence.length === 0 ? (
                <Text style={styles.line}>No evidence has been attached yet.</Text>
              ) : (
                incident.evidence.map((evidence) => (
                  <View key={evidence.ref} style={styles.evidence}>
                    <Text style={styles.evidenceKind}>{evidence.type}</Text>
                    <Text style={styles.evidenceText}>{evidence.summary}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Timeline</Text>
              {incident.timeline.map((item, index) => (
                <View key={`${item.at}:${index}`} style={styles.timeline}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineEvent}>{item.event}</Text>
                    {item.detail ? <Text style={styles.line}>{item.detail}</Text> : null}
                    <Text style={styles.time}>{new Date(item.at).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, gap: 14, paddingBottom: 34 },
  back: { flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 4 },
  backText: { color: palette.text, fontSize: 13, fontWeight: '800' },
  error: { color: palette.red },
  eyebrow: { color: palette.red, fontSize: 10, letterSpacing: 1.3, fontWeight: '900' },
  title: { color: palette.text, fontSize: 25, lineHeight: 30, fontWeight: '900' },
  summary: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 9 },
  secondary: {
    flex: 1,
    height: 45,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: palette.text, fontSize: 12, fontWeight: '900' },
  primary: {
    flex: 1,
    height: 45,
    borderRadius: 13,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: palette.bg, fontSize: 12, fontWeight: '900' },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 15,
    gap: 10,
  },
  cardTitle: { color: palette.text, fontSize: 15, fontWeight: '900' },
  line: { color: palette.muted, fontSize: 11, lineHeight: 16 },
  evidence: { backgroundColor: palette.surface2, borderRadius: radius.md, padding: 11, gap: 4 },
  evidenceKind: { color: palette.accent, fontSize: 9, fontWeight: '900' },
  evidenceText: { color: palette.text, fontSize: 11, lineHeight: 16 },
  timeline: { flexDirection: 'row', gap: 10 },
  timelineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: palette.accent, marginTop: 5 },
  timelineBody: { flex: 1, gap: 3, paddingBottom: 7 },
  timelineEvent: { color: palette.text, fontSize: 12, fontWeight: '800' },
  time: { color: palette.muted, fontSize: 9 },
});
