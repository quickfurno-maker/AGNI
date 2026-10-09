import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusChip } from '@/components/StatusChip';
import { getOverview } from '@/lib/api';
import { fonts, palette, type NeonTone } from '@/lib/theme';
import type { HealthState } from '@/types/owner';

const healthTone: Record<HealthState, NeonTone> = {
  HEALTHY: 'green',
  DEGRADED: 'fire',
  UNHEALTHY: 'danger',
  UNKNOWN: 'neutral',
};

const descriptions: Record<string, string> = {
  QUICKFURNO: 'API · Database · Matching · Workers · Vendors · Payments',
  JARVIS: 'Riya · Anisha · Aarohi · WhatsApp · Workers · Model Provider',
  AGNI: 'Telemetry · Security · Action Broker · OpenAI · Automation',
};

export default function SystemsScreen() {
  const overview = useQuery({
    queryKey: ['owner-overview'],
    queryFn: getOverview,
    refetchInterval: 15_000,
  });

  return (
    <CommandScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefetching}
            onRefresh={() => void overview.refetch()}
            tintColor={palette.blueBright}
          />
        }
      >
        <ScreenHeader
          title="Systems"
          subtitle="Real-time health surface for QuickFurno, Jarvis and AGNI."
          eyebrow="SYSTEM MATRIX // LIVE"
        />

        {overview.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.blueBright} />
            <Text style={styles.muted}>SYNCING SYSTEM MATRIX...</Text>
          </View>
        ) : null}

        {overview.data?.systems.map((system, index) => {
          const key = String(system.system).toUpperCase();
          const tone: NeonTone = index === 0 ? 'blue' : index === 1 ? 'purple' : 'fire';
          return (
            <NeonPanel key={system.system} tone={tone}>
              <View style={styles.systemTop}>
                <View style={[styles.icon, { borderColor: palette.blueBright + '66' }]}>
                  <Ionicons
                    name={index === 0 ? 'flash' : index === 1 ? 'git-network' : 'shield-checkmark'}
                    size={22}
                    color={index === 2 ? palette.fire : index === 1 ? palette.purple : palette.blueBright}
                  />
                </View>
                <View style={styles.systemCopy}>
                  <Text style={styles.systemTitle}>{system.label}</Text>
                  <Text style={styles.systemDescription}>
                    {descriptions[key] ?? 'Live operational subsystem'}
                  </Text>
                </View>
                <StatusChip label={system.state} tone={healthTone[system.state]} compact />
              </View>
              <View style={styles.footer}>
                <Text style={styles.footerText}>DRILL-DOWN SURFACE</Text>
                <Text style={styles.footerReady}>READY FOR PHASE 2 BINDINGS</Text>
              </View>
            </NeonPanel>
          );
        })}

        <NeonPanel tone="neutral">
          <View style={styles.consoleRow}>
            <Ionicons name="terminal-outline" size={17} color={palette.cyan} />
            <Text style={styles.console}>
              $ agni systems --scope=all --mode=owner
            </Text>
          </View>
          <Text style={styles.muted}>
            The navigation and visual shell are live. Detailed metrics, dependencies and recent activity bind in Phase 2.
          </Text>
        </NeonPanel>
      </ScrollView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 10, lineHeight: 16 },
  systemTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: 13,
    backgroundColor: '#071522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemCopy: { flex: 1, gap: 4 },
  systemTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 16, fontWeight: '900' },
  systemDescription: { color: palette.muted, fontFamily: fonts.mono, fontSize: 9, lineHeight: 14 },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  footerText: { color: palette.dim, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800' },
  footerReady: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  consoleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  console: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 10, fontWeight: '800' },
});
