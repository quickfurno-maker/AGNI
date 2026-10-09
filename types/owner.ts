export type HealthState = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
export type OwnerSystem = 'QUICKFURNO' | 'JARVIS' | 'AGNI';
export type IncidentSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
export type ApprovalRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SystemStatus {
  system: OwnerSystem;
  label: string;
  state: HealthState;
  observedAt: string;
  summary?: string;
}

export interface OwnerMetric {
  key: string;
  label: string;
  value: string;
  trend?: 'UP' | 'DOWN' | 'FLAT';
  attention?: boolean;
}

export interface ActivityEvent {
  eventId: string;
  occurredAt: string;
  kind:
    | 'INCIDENT'
    | 'RECOVERY'
    | 'AGENT'
    | 'LEAD'
    | 'PAYMENT'
    | 'VENDOR'
    | 'RELEASE'
    | 'SECURITY'
    | 'SYSTEM';
  title: string;
  summary?: string;
  route?: string;
}

export interface OwnerOverview {
  observedAt: string;
  overall: HealthState;
  systems: readonly SystemStatus[];
  metrics: readonly OwnerMetric[];
  attention: readonly {
    id: string;
    severity: IncidentSeverity | 'ATTENTION';
    title: string;
    summary: string;
    route?: string;
  }[];
  activity: readonly ActivityEvent[];
}

export interface IncidentSummary {
  incidentId: string;
  severity: IncidentSeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  targetSystem: OwnerSystem;
  targetService: string;
  title: string;
  summary: string;
  firstObservedAt: string;
  affectedCount?: number;
  confidence?: number;
  recommendedAction?: string;
}

export interface IncidentDetail extends IncidentSummary {
  rootCause?: string;
  impact?: string;
  evidence: readonly {
    ref: string;
    type: 'METRIC' | 'LOG' | 'TRACE' | 'RELEASE' | 'CASE' | 'CODE' | 'AUDIT';
    summary: string;
  }[];
  timeline: readonly {
    at: string;
    event: string;
    detail?: string;
  }[];
}

export interface ApprovalSummary {
  approvalId: string;
  incidentId: string;
  title: string;
  summary: string;
  risk: ApprovalRisk;
  actionType: string;
  targetSystem: OwnerSystem;
  targetService: string;
  expiresAt: string;
  confidence?: number;
  impact?: string;
  rollbackAvailable: boolean;
  databaseMutation: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXECUTED';
}

export interface ChatEvidenceCard {
  id: string;
  title: string;
  kind: 'STATUS' | 'METRICS' | 'INCIDENT' | 'VENDOR' | 'AGENT' | 'INFRA' | 'RELEASE' | 'SECURITY';
  lines: readonly string[];
  route?: string;
}

export interface OwnerChatResponse {
  messageId: string;
  conversationId: string;
  reply: string;
  status: 'ANSWERED' | 'NEEDS_DIAGNOSTIC' | 'NEEDS_HUMAN_APPROVAL' | 'INSUFFICIENT_EVIDENCE';
  evidence: readonly ChatEvidenceCard[];
  suggestedActions: readonly ('INVESTIGATE' | 'PREPARE_FIX' | 'OPEN_INCIDENT' | 'NONE')[];
  observedAt: string;
  safeCode?: string;
}

export interface OwnerSession {
  ownerId: string;
  deviceId: string;
  displayName: string;
  expiresAt: string;
}


export type MarketCellState =
  | 'UNDER_SUPPLIED'
  | 'BALANCED'
  | 'OVER_SUPPLIED'
  | 'LOW_QUALITY_SUPPLY'
  | 'DEMAND_STARVED';

export type MarketRecommendation =
  | 'ACQUIRE_VENDORS'
  | 'MAINTAIN'
  | 'HOLD_PACKAGE_ACTIVATION'
  | 'IMPROVE_VENDOR_QUALITY'
  | 'BOOST_CLIENT_DEMAND';


export interface MarketIntelligenceCell {
  cellRef: string;
  cityRef: string;
  localityRef?: string;
  categoryRef: string;
  state: MarketCellState;
  recommendation: MarketRecommendation;
  demand30d: number;
  effectiveSupply: number;
  opportunitiesPerEffectiveVendor30d: number | null;
  threeVendorFillRate: number;
  confidence: number;
  reasons: readonly string[];
}


export interface MarketIntelligence {
  observedAt: string;
  sourceObservedAt?: string;
  status: 'AVAILABLE' | 'STALE' | 'UNUSABLE' | 'NOT_CONNECTED';
  responseEvidence?: 'AVAILABLE' | 'UNAVAILABLE';
  cellsTotal?: number;
  cellsTruncated?: boolean;
  summary: {
    underSupplied: number;
    balanced: number;
    overSupplied: number;
    lowQualitySupply: number;
    demandStarved: number;
  };
  cells: readonly MarketIntelligenceCell[];
}
