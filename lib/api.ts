import Constants from 'expo-constants';

import {
  clearSessionToken,
  readGatewayUrl,
  readSessionToken,
  writeDeviceId,
  writeGatewayUrl,
  writeSessionToken,
} from '@/lib/storage';
import type {
  ApprovalSummary,
  IncidentDetail,
  IncidentSummary,
  MarketIntelligence,
  OwnerChatResponse,
  OwnerOverview,
  OwnerSession,
} from '@/types/owner';

const MAX_RESPONSE_BYTES = 512 * 1024;

function defaultGateway(): string {
  const env = process.env.EXPO_PUBLIC_OWNER_GATEWAY_URL?.trim();
  const configured = Constants.expoConfig?.extra?.ownerGatewayDefaultUrl;
  return env || (typeof configured === 'string' ? configured : 'https://owner.quickfurno.in');
}

export function normalizeGatewayUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Gateway must be a clean HTTPS origin.');
  }
  return url.origin;
}

async function parseBoundedJson<T>(response: Response): Promise<T> {
  const declared = response.headers.get('content-length');
  if (declared && Number(declared) > MAX_RESPONSE_BYTES) throw new Error('Response too large.');
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
    throw new Error('Response too large.');
  }
  if (!response.ok) {
    let code = 'request_failed';
    try {
      const body = JSON.parse(text) as { error?: unknown };
      if (typeof body.error === 'string') code = body.error;
    } catch {}
    throw new Error(code);
  }
  return JSON.parse(text) as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; timeoutMs?: number } = {},
): Promise<T> {
  const gateway = normalizeGatewayUrl((await readGatewayUrl()) ?? defaultGateway());
  const token = options.auth === false ? null : await readSessionToken();
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (init.body !== undefined) headers.set('content-type', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  const response = await fetch(new URL(path, gateway), {
    ...init,
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(options.timeoutMs ?? 15_000),
  });
  if (response.status === 401 && options.auth !== false) {
    await clearSessionToken();
  }
  return parseBoundedJson<T>(response);
}

export async function enrollDevice(input: {
  gatewayUrl: string;
  pairingCode: string;
  deviceName: string;
}): Promise<OwnerSession> {
  const gateway = normalizeGatewayUrl(input.gatewayUrl);
  await writeGatewayUrl(gateway);
  const response = await request<{
    protocol: 'agni.owner.device-enroll.response.v1';
    session: OwnerSession;
    sessionToken: string;
  }>(
    '/v2/owner/device/enroll',
    {
      method: 'POST',
      body: JSON.stringify({
        protocol: 'agni.owner.device-enroll.v1',
        pairingCode: input.pairingCode.trim(),
        deviceName: input.deviceName.slice(0, 80),
        platform: 'ANDROID',
      }),
    },
    { auth: false, timeoutMs: 20_000 },
  );
  await Promise.all([
    writeSessionToken(response.sessionToken),
    writeDeviceId(response.session.deviceId),
  ]);
  return response.session;
}

export async function getSession(): Promise<OwnerSession> {
  return request<OwnerSession>('/v2/owner/session');
}

export async function getOverview(): Promise<OwnerOverview> {
  return request<OwnerOverview>('/v2/owner/overview');
}

export async function getMarketIntelligence(): Promise<MarketIntelligence> {
  return request<MarketIntelligence>('/v2/owner/market-intelligence');
}

export async function listIncidents(
  status: 'open' | 'resolved' | 'all' = 'open',
): Promise<readonly IncidentSummary[]> {
  return request<readonly IncidentSummary[]>(`/v2/owner/incidents?status=${status}`);
}

export async function getIncident(incidentId: string): Promise<IncidentDetail> {
  return request<IncidentDetail>(`/v2/owner/incidents/${encodeURIComponent(incidentId)}`);
}

export async function listApprovals(): Promise<readonly ApprovalSummary[]> {
  return request<readonly ApprovalSummary[]>('/v2/owner/approvals?status=pending');
}

export async function decideApproval(
  approvalId: string,
  decision: 'APPROVE' | 'REJECT',
): Promise<{ status: string }> {
  return request<{ status: string }>(
    `/v2/owner/approvals/${encodeURIComponent(approvalId)}/decision`,
    {
      method: 'POST',
      body: JSON.stringify({
        protocol: 'agni.owner.approval-decision.v1',
        decision,
      }),
    },
    { timeoutMs: 20_000 },
  );
}

export async function ownerChat(input: {
  conversationId?: string;
  query: string;
  contextRef?: string;
  intent?: 'CHAT' | 'INVESTIGATE' | 'PREPARE_FIX';
}): Promise<OwnerChatResponse> {
  return request<OwnerChatResponse>(
    '/v2/owner/chat',
    {
      method: 'POST',
      body: JSON.stringify({
        protocol: 'agni.owner.chat.v2',
        ...(input.conversationId ? { conversationId: input.conversationId } : {}),
        query: input.query.slice(0, 2000),
        ...(input.contextRef ? { contextRef: input.contextRef } : {}),
        intent: input.intent ?? 'CHAT',
      }),
    },
    { timeoutMs: 30_000 },
  );
}
