import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { enrollDevice, getSession } from '@/lib/api';
import { clearSessionToken, readSessionToken } from '@/lib/storage';
import type { OwnerSession } from '@/types/owner';

type SessionState =
  | { status: 'LOADING'; session: null }
  | { status: 'UNPAIRED'; session: null }
  | { status: 'READY'; session: OwnerSession };

interface SessionContextValue {
  state: SessionState;
  pair(input: { gatewayUrl: string; pairingCode: string }): Promise<void>;
  signOut(): Promise<void>;
  confirmSensitiveAction(): Promise<boolean>;
  refresh(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function OwnerSessionProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<SessionState>({ status: 'LOADING', session: null });

  const refresh = useCallback(async () => {
    const token = await readSessionToken();
    if (!token) {
      setState({ status: 'UNPAIRED', session: null });
      return;
    }
    try {
      const session = await getSession();
      setState({ status: 'READY', session });
    } catch {
      await clearSessionToken();
      setState({ status: 'UNPAIRED', session: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pair = useCallback(async (input: { gatewayUrl: string; pairingCode: string }) => {
    const session = await enrollDevice({
      ...input,
      deviceName: Device.deviceName ?? 'AGNI Android',
    });
    setState({ status: 'READY', session });
  }, []);

  const signOut = useCallback(async () => {
    await clearSessionToken();
    setState({ status: 'UNPAIRED', session: null });
  }, []);

  const confirmSensitiveAction = useCallback(async () => {
    const supported = await LocalAuthentication.hasHardwareAsync();
    const enrolled = supported ? await LocalAuthentication.isEnrolledAsync() : false;
    if (!supported || !enrolled) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Approve AGNI production action',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  }, []);

  const value = useMemo(
    () => ({ state, pair, signOut, confirmSensitiveAction, refresh }),
    [state, pair, signOut, confirmSensitiveAction, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useOwnerSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('OwnerSessionProvider missing');
  return value;
}
