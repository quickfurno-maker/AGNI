import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusChip } from '@/components/StatusChip';
import { fonts, palette } from '@/lib/theme';

const modules: readonly {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  live?: boolean;
}[] = [
  { label: 'Approvals', subtitle: 'Human-gated production actions', icon: 'finger-print', color: palette.purple, live: true },
  { label: 'Deployments', subtitle: 'Recent and past deployments', icon: 'rocket-outline', color: palette.fire },
  { label: 'Observability', subtitle: 'Logs, metrics and traces', icon: 'pulse-outline', color: palette.cyan },
  { label: 'Security', subtitle: 'Access, devices and audit signals', icon: 'shield-checkmark-outline', color: palette.green },
  { label: 'Automation', subtitle: 'Scheduled tasks and governed rules', icon: 'timer-outline', color: palette.blueBright },
  { label: 'Activity Log', subtitle: 'Recent actions and events', icon: 'list-outline', color: palette.purple },
  { label: 'Owner Devices', subtitle: 'Manage paired owner devices', icon: 'phone-portrait-outline', color: palette.blueBright },
  { label: 'Notifications', subtitle: 'Alerts and preferences', icon: 'notifications-outline', color: palette.red },
  { label: 'Telegram', subtitle: 'Operator channel integration', icon: 'paper-plane-outline', color: palette.blueBright },
  { label: 'Emergency Controls', subtitle: 'Pause automation and restrict actions', icon: 'warning-outline', color: palette.fire },
  { label: 'Settings', subtitle: 'App preferences and appearance', icon: 'settings-outline', color: palette.muted },
];

export default function MoreScreen() {
  return (
    <CommandScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          brand
          title="Operations"
          subtitle="Advanced owner controls and system surfaces."
          eyebrow="AGNI // MORE"
        />

        <NeonPanel tone="fire">
          <View style={styles.lockedRow}>
            <Ionicons name="flash" size={18} color={palette.fire} />
            <View style={styles.flex}>
              <Text style={styles.lockedTitle}>OWNER AUTHORITY ONLINE</Text>
              <Text style={styles.subtitle}>High-risk actions remain biometric + policy gated.</Text>
            </View>
            <StatusChip label="LOCKED" tone="green" compact />
          </View>
        </NeonPanel>

        <View style={styles.list}>
          {modules.map((module) => (
            <Pressable
              key={module.label}
              onPress={() => {
                if (module.label === 'Approvals') router.push('/(tabs)/approvals');
              }}
              style={({ pressed }) => [styles.row, pressed && module.live && styles.pressed]}
            >
              <View style={[styles.icon, { borderColor: module.color + '77' }]}>
                <Ionicons name={module.icon} size={18} color={module.color} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{module.label}</Text>
                <Text style={styles.subtitle}>{module.subtitle}</Text>
              </View>
              {module.live ? (
                <StatusChip label="OPEN" tone="blue" compact />
              ) : (
                <Text style={styles.phase}>PHASE 3</Text>
              )}
              <Ionicons name="chevron-forward" size={15} color={palette.dim} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  lockedTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 11, fontWeight: '900' },
  subtitle: { color: palette.muted, fontFamily: fonts.mono, fontSize: 9, lineHeight: 14 },
  list: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    backgroundColor: '#06101A',
    overflow: 'hidden',
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  pressed: { backgroundColor: '#0A1A2D' },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    backgroundColor: '#091521',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 12, fontWeight: '900' },
  phase: { color: palette.dim, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
});
