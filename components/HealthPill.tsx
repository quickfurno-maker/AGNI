import { StatusChip } from '@/components/StatusChip';
import type { NeonTone } from '@/lib/theme';
import type { HealthState } from '@/types/owner';

const tone: Record<HealthState, NeonTone> = {
  HEALTHY: 'green',
  DEGRADED: 'fire',
  UNHEALTHY: 'danger',
  UNKNOWN: 'neutral',
};

export function HealthPill({ label, state }: { label: string; state: HealthState }) {
  return <StatusChip label={label} tone={tone[state]} />;
}
