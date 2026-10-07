import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { decideApproval, listApprovals } from '@/lib/api';
import { palette, radius } from '@/lib/theme';
import { useOwnerSession } from '@/state/session';
import type { ApprovalRisk } from '@/types/owner';

const riskColor: Record<ApprovalRisk, string> = {
  LOW: palette.green,
  MEDIUM: palette.yellow,
  HIGH: palette.red,
  CRITICAL: '#FF2F45',
};

export default function ApprovalsScreen() {
  const queryClient = useQueryClient();
  const { confirmSensitiveAction } = useOwnerSession();
  const [activeId, setActiveId] = useState<string | null>(null);
  const approvals = useQuery({
    queryKey: ['owner-approvals'],
    queryFn: listApprovals,
    refetchInterval: 15_000,
  });
  const decision = useMutation({
    mutationFn: ({ id, value }: { id: string; value: 'APPROVE' | 'REJECT' }) =>
      decideApproval(id, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner-approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['owner-overview'] });
    },
    onSettled: () => setActiveId(null),
  });

  async function approve(id: string, title: string) {
    const confirmed = await confirmSensitiveAction();
    if (!confirmed) {
      Alert.alert('Approval not confirmed', 'Device biometric confirmation is required.');
      return;
    }
    Alert.alert('Approve production action?', title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        style: 'destructive',
        onPress: () => {
          setActiveId(id);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          decision.mutate({ id, value: 'APPROVE' });
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HUMAN AUTHORITY</Text>
          <Text style={styles.title}>Approvals</Text>
          <Text style={styles.subtitle}>
            AGNI may prepare repairs. Production-changing actions stay blocked until policy and owner approval succeed.
          </Text>
        </View>

        {approvals.isLoading ? <ActivityIndicator color={palette.accent} /> : null}

        {approvals.data?.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing waiting for you.</Text>
            <Text style={styles.subtitle}>Safe automatic recovery and read-only diagnostics do not appear here.</Text>
          </View>
        ) : null}

        {approvals.data?.map((approval) => (
          <View key={approval.approvalId} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{approval.title}</Text>
              <View style={[styles.risk, { borderColor: riskColor[approval.risk] }]}>
                <Text style={[styles.riskText, { color: riskColor[approval.risk] }]}>{approval.risk}</Text>
              </View>
            </View>
            <Text style={styles.summary}>{approval.summary}</Text>

            <View style={styles.facts}>
              <Text style={styles.fact}>Target · {approval.targetService}</Text>
              <Text style={styles.fact}>Action · {approval.actionType.replaceAll('_', ' ')}</Text>
              <Text style={styles.fact}>Rollback · {approval.rollbackAvailable ? 'Available' : 'No'}</Text>
              <Text style={styles.fact}>DB mutation · {approval.databaseMutation ? 'Yes' : 'No'}</Text>
              {approval.confidence !== undefined ? (
                <Text style={styles.fact}>Confidence · {Math.round(approval.confidence * 100)}%</Text>
              ) : null}
            </View>

            {approval.impact ? <Text style={styles.impact}>Expected impact: {approval.impact}</Text> : null}

            <View style={styles.actions}>
              <Pressable
                disabled={decision.isPending}
                style={styles.reject}
                onPress={() => {
                  setActiveId(approval.approvalId);
                  decision.mutate({ id: approval.approvalId, value: 'REJECT' });
                }}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </Pressable>
              <Pressable
                disabled={decision.isPending}
                style={styles.approve}
                onPress={() => void approve(approval.approvalId, approval.title)}
              >
                {activeId === approval.approvalId && decision.isPending ? (
                  <ActivityIndicator color={palette.bg} size="small" />
                ) : (
                  <Text style={styles.approveText}>Approve Fix</Text>
                )}
              </Pressable>
            </View>
          </View>
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
  empty: {
    marginTop: 50,
    padding: 22,
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
  },
  emptyTitle: { color: palette.text, fontSize: 15, fontWeight: '900' },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 16,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cardTitle: { color: palette.text, flex: 1, fontSize: 16, fontWeight: '900' },
  risk: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  riskText: { fontSize: 9, fontWeight: '900' },
  summary: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  facts: { gap: 5 },
  fact: { color: palette.text, fontSize: 11, fontWeight: '700' },
  impact: { color: palette.yellow, fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 3 },
  reject: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: { color: palette.text, fontWeight: '900', fontSize: 12 },
  approve: {
    flex: 1.5,
    height: 44,
    borderRadius: 13,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: { color: palette.bg, fontWeight: '900', fontSize: 12 },
});
