import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { getMarketIntelligence } from '@/lib/api';
import { fonts, palette, radius, type NeonTone } from '@/lib/theme';
import type { MarketCellState, MarketIntelligenceCell } from '@/types/owner';

type Filter = 'ALL' | MarketCellState;

const FILTERS: readonly Filter[] = [
  'ALL',
  'UNDER_SUPPLIED',
  'OVER_SUPPLIED',
  'LOW_QUALITY_SUPPLY',
  'DEMAND_STARVED',
  'BALANCED',
];

const TONE: Record<MarketCellState, NeonTone> = {
  UNDER_SUPPLIED: 'fire',
  BALANCED: 'green',
  OVER_SUPPLIED: 'purple',
  LOW_QUALITY_SUPPLY: 'danger',
  DEMAND_STARVED: 'blue',
};

function label(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/gu, (char) => char.toUpperCase());
}

function pct(value: number): string {
  return Math.round(value * 100) + '%';
}

function stat(labelText: string, value: string) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{labelText}</Text>
    </View>
  );
}

function askPrompt(cell: MarketIntelligenceCell): string {
  const where = cell.localityRef ?? cell.cityRef;
  return (
    'Explain the AOS marketplace assessment for ' +
    label(where) +
    ' / ' +
    label(cell.categoryRef) +
    '. State is ' +
    cell.state +
    ' and recommendation is ' +
    cell.recommendation +
    '. What should we do next and why?'
  );
}

export default function MarketScreen() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const market = useQuery({
    queryKey: ['owner-market-intelligence'],
    queryFn: getMarketIntelligence,
    refetchInterval: 60_000,
  });
  const data = market.data;
  const cells = useMemo(
    () => (data?.cells ?? []).filter((cell) => filter === 'ALL' || cell.state === filter),
    [data?.cells, filter],
  );

  return (
    <CommandScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={market.isRefetching}
            onRefresh={() => void market.refetch()}
            tintColor={palette.blueBright}
          />
        }
      >
        <View style={styles.header}>
          <AgniMark size={40} />
          <View style={styles.headerCopy}>
            <Text style={styles.brand}>AOS // MARKET INTELLIGENCE</Text>
            <Text style={styles.sub}>AREA × CATEGORY SUPPLY COMMAND</Text>
          </View>
          <StatusChip
            label={data?.status ?? 'SYNC'}
            tone={data?.status === 'AVAILABLE' ? 'green' : 'fire'}
            compact
          />
        </View>

        {market.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.blueBright} />
            <Text style={styles.muted}>$ reading governed market cells...</Text>
          </View>
        ) : null}

        {market.isError ? (
          <NeonPanel tone="danger">
            <Text style={styles.title}>MARKET FEED UNAVAILABLE</Text>
            <Text style={styles.muted}>No business action was attempted. Pull to retry.</Text>
          </NeonPanel>
        ) : null}

        {data ? (
          <>
            <NeonPanel tone={data.status === 'AVAILABLE' ? 'blue' : 'fire'}>
              <View style={styles.sectionHead}>
                <View>
                  <Text style={styles.title}>SUPPLY / DEMAND PULSE</Text>
                  <Text style={styles.muted}>
                    30-day demand · effective vendor supply · 3-vendor fill
                  </Text>
                </View>
                <Ionicons name="pulse" size={20} color={palette.cyan} />
              </View>
              <View style={styles.summaryGrid}>
                {stat('NEED VENDORS', String(data.summary.underSupplied))}
                {stat('OVER SUPPLY', String(data.summary.overSupplied))}
                {stat('LOW QUALITY', String(data.summary.lowQualitySupply))}
                {stat('DEMAND STARVED', String(data.summary.demandStarved))}
                {stat('BALANCED', String(data.summary.balanced))}
                {stat('TOTAL CELLS', String(data.cellsTotal ?? data.cells.length))}
              </View>
              {data.responseEvidence === 'UNAVAILABLE' ? (
                <Text style={styles.note}>
                  RESPONSE QUALITY // awaiting authoritative vendor-contact evidence
                </Text>
              ) : null}
            </NeonPanel>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filter, filter === item && styles.filterActive]}
                >
                  <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                    {item === 'ALL' ? 'ALL' : label(item)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {data.status !== 'AVAILABLE' ? (
              <NeonPanel tone="fire">
                <Text style={styles.title}>AOS MARKET FEED {data.status}</Text>
                <Text style={styles.muted}>
                  AGNI will not infer supply decisions from stale or unusable evidence.
                </Text>
              </NeonPanel>
            ) : null}

            {cells.length === 0 && data.status === 'AVAILABLE' ? (
              <NeonPanel tone="neutral">
                <Text style={styles.good}>✓ NO CELLS MATCH THIS FILTER</Text>
              </NeonPanel>
            ) : null}

            {cells.map((cell) => (
              <NeonPanel key={cell.cellRef} tone={TONE[cell.state]}>
                <View style={styles.cellHead}>
                  <View style={styles.cellCopy}>
                    <Text style={styles.cellTitle}>
                      {label(cell.localityRef ?? cell.cityRef)}{' // '}{label(cell.categoryRef)}
                    </Text>
                    <Text style={styles.cellRef}>{cell.cellRef}</Text>
                  </View>
                  <StatusChip label={label(cell.state)} tone={TONE[cell.state]} compact />
                </View>

                <View style={styles.cellStats}>
                  {stat('DEMAND 30D', String(cell.demand30d))}
                  {stat('EFFECTIVE SUPPLY', cell.effectiveSupply.toFixed(1))}
                  {stat(
                    'OPP / VENDOR',
                    cell.opportunitiesPerEffectiveVendor30d === null
                      ? '—'
                      : cell.opportunitiesPerEffectiveVendor30d.toFixed(1),
                  )}
                  {stat('3-VENDOR FILL', pct(cell.threeVendorFillRate))}
                </View>

                <View style={styles.recommendation}>
                  <Ionicons name="flash" size={16} color={palette.lightning} />
                  <View style={styles.recommendationCopy}>
                    <Text style={styles.recommendationLabel}>AOS RECOMMENDATION</Text>
                    <Text style={styles.recommendationValue}>{label(cell.recommendation)}</Text>
                  </View>
                  <Text style={styles.confidence}>{pct(cell.confidence)}</Text>
                </View>

                {cell.reasons.slice(0, 3).map((reason) => (
                  <Text key={reason} style={styles.reason}>
                    {'>'} {label(reason)}
                  </Text>
                ))}

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/chat',
                      params: { prompt: askPrompt(cell) },
                    })
                  }
                  style={styles.ask}
                >
                  <Ionicons name="chatbubble-ellipses" size={15} color={palette.blueBright} />
                  <Text style={styles.askText}>ASK AGNI ABOUT THIS CELL</Text>
                  <Ionicons name="chevron-forward" size={15} color={palette.blueBright} />
                </Pressable>
              </NeonPanel>
            ))}

            {data.cellsTruncated ? (
              <Text style={styles.note}>
                SOURCE WINDOW TRUNCATED // showing the highest-priority governed cells
              </Text>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 112, gap: 11 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 2 },
  headerCopy: { flex: 1 },
  brand: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sub: {
    color: palette.blueBright,
    fontFamily: fonts.mono,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 },
  title: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  muted: { color: palette.muted, fontFamily: fonts.mono, fontSize: 9, lineHeight: 14 },
  good: { color: palette.green, fontFamily: fonts.mono, fontSize: 9, fontWeight: '900' },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  stat: {
    flexGrow: 1,
    minWidth: '30%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    borderRadius: radius.sm,
    backgroundColor: '#06101B',
    padding: 8,
  },
  statValue: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    color: palette.muted,
    fontFamily: fonts.mono,
    fontSize: 7,
    fontWeight: '800',
    marginTop: 3,
  },
  note: {
    color: palette.cyan,
    fontFamily: fonts.mono,
    fontSize: 8,
    lineHeight: 13,
    marginTop: 9,
  },
  filters: { gap: 7, paddingVertical: 2 },
  filter: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.pill,
    backgroundColor: '#06101B',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterActive: { borderColor: palette.blueBright, backgroundColor: '#0A2147' },
  filterText: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800' },
  filterTextActive: { color: palette.blueBright },
  cellHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cellCopy: { flex: 1 },
  cellTitle: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '900',
  },
  cellRef: { color: palette.dim, fontFamily: fonts.mono, fontSize: 7, marginTop: 3 },
  cellStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 11 },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 11,
    padding: 9,
    borderWidth: 1,
    borderColor: palette.lightning + '55',
    borderRadius: radius.sm,
    backgroundColor: '#151308',
  },
  recommendationCopy: { flex: 1 },
  recommendationLabel: {
    color: palette.lightning,
    fontFamily: fonts.mono,
    fontSize: 7,
    fontWeight: '900',
  },
  recommendationValue: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  confidence: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 9, fontWeight: '900' },
  reason: {
    color: palette.muted,
    fontFamily: fonts.mono,
    fontSize: 8,
    lineHeight: 13,
    marginTop: 5,
  },
  ask: {
    minHeight: 42,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
  },
  askText: {
    flex: 1,
    color: palette.blueBright,
    fontFamily: fonts.mono,
    fontSize: 8,
    fontWeight: '900',
  },
});
