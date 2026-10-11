import { useQuery } from '@tanstack/react-query';
import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';

import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusChip } from '@/components/StatusChip';
import { getPhase12Certification } from '@/lib/api';
import { fonts, palette } from '@/lib/theme';

const fmt = (value: unknown): string => typeof value === 'string' || typeof value === 'number' ? String(value) : '--';

export default function CertificationScreen() {
  // Owner-triggered only; never poll the 16-gate dossier on a routine screen refresh.
  const review = useQuery({
    queryKey: ['agni-phase12-certification'],
    queryFn: getPhase12Certification,
    enabled: false,
    retry: false,
  });
  const report = review.data;
  const valid = report?.protocol === 'agni.phase12.certification.v1'
    && report.authority === 'EVALUATION_ONLY'
    && report.executionAuthority === 'NONE'
    && report.approvedForL4 === false
    && report.approvedAutonomy === 'L0_L1_ONLY'
    && report.gates?.length === 16;
  return (
    <CommandScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          brand
          title="CERTIFICATION"
          eyebrow="AGNI // PHASE 12"
          subtitle="Source-bound readiness evidence. No automatic repair authority."
        />
        <NeonPanel tone="fire">
          <View style={styles.headRow}>
            <Text style={styles.heading}>AUTONOMY BOUNDARY</Text>
            <StatusChip label="L4 OFF" tone="fire" compact />
          </View>
          <Text style={styles.note}>The Phase 12A dossier is review-only. A passing assessment never authorizes execution. The Phase 12B telemetry-cache playbook remains shadow simulation with no executor.</Text>
        </NeonPanel>

        <Pressable
          accessibilityRole="button"
          disabled={review.isFetching}
          onPress={() => void review.refetch()}
          style={[styles.action, review.isFetching && styles.disabled]}
        >
          <Text style={styles.actionText}>{review.isFetching ? 'CHECKING VERIFIED EVIDENCE...' : 'CHECK OWNER EVIDENCE'}</Text>
        </Pressable>

        {review.isError && <NeonPanel tone="fire"><Text style={styles.note}>Evidence unavailable. Certification remains blocked until a trusted owner session and source-specific attestations are verified.</Text></NeonPanel>}

        {report && !valid && <NeonPanel tone="fire"><Text style={styles.note}>CERTIFICATION CONTRACT REFUSED. This response cannot be treated as authorization.</Text></NeonPanel>}
        {report && valid && (
          <NeonPanel tone="blue">
            <View style={styles.headRow}>
              <Text style={styles.heading}>INDEPENDENT GATES</Text>
              <StatusChip label={report.status === 'READY_FOR_HUMAN_REVIEW' ? 'REVIEW ONLY' : 'BLOCKED'} tone="fire" compact />
            </View>
            <Text style={styles.big}>{report.passed} / 16</Text>
            <Text style={styles.note}>Missing / failed / untrusted gates: {fmt(report.missingOrRefused)}</Text>
            <Text style={styles.mono}>SOURCE {fmt(report.releaseSha)}</Text>
            {report.gates.map((gate) => (
              <View key={gate.gate} style={styles.gateRow}>
                <Text style={styles.gateTitle}>{gate.gate.replaceAll('_', ' ')}</Text>
                <Text style={[styles.gateStatus, gate.finding === 'PASS' ? styles.ok : styles.bad]}>{gate.finding}</Text>
              </View>
            ))}
            <Text style={styles.note}>All results are read-only. Open the AGNI Web command center for the full evidence graph and simulation review.</Text>
          </NeonPanel>
        )}
        {!report && !review.isFetching && !review.isError && <Text style={styles.note}>No certification data requested yet. Tap CHECK OWNER EVIDENCE to load a fresh bounded result.</Text>}
      </ScrollView>
    </CommandScreen>
  );
}
const styles=StyleSheet.create({
  content:{padding:16,paddingBottom:110,gap:14},
  headRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
  heading:{fontFamily:fonts.mono,color:palette.blueBright,fontWeight:'900',fontSize:13},
  note:{fontFamily:fonts.mono,color:palette.muted,fontSize:11,lineHeight:18,marginTop:8},
  big:{fontFamily:fonts.mono,color:palette.lightning,fontWeight:'900',fontSize:29,marginTop:12},
  mono:{fontFamily:fonts.mono,color:palette.muted,fontSize:9,marginTop:8},
  action:{borderWidth:1,borderColor:palette.lightning,backgroundColor:'#101926',borderRadius:12,padding:14,alignItems:'center'},
  actionText:{fontFamily:fonts.mono,color:palette.lightning,fontWeight:'900',fontSize:11},
  disabled:{opacity:0.5},
  gateRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:9,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:palette.border},
  gateTitle:{fontFamily:fonts.mono,color:palette.text,fontSize:9,flex:1,paddingRight:12},
  gateStatus:{fontFamily:fonts.mono,fontSize:9,fontWeight:'900'},
  ok:{color:palette.green},
  bad:{color:palette.fire}
});
