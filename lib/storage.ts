import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN = 'agni.owner.session-token';
const GATEWAY_URL = 'agni.owner.gateway-url';
const DEVICE_ID = 'agni.owner.device-id';

export async function readSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN);
}

export async function writeSessionToken(value: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN);
}

export async function readGatewayUrl(): Promise<string | null> {
  return SecureStore.getItemAsync(GATEWAY_URL);
}

export async function writeGatewayUrl(value: string): Promise<void> {
  await SecureStore.setItemAsync(GATEWAY_URL, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function readDeviceId(): Promise<string | null> {
  return SecureStore.getItemAsync(DEVICE_ID);
}

export async function writeDeviceId(value: string): Promise<void> {
  await SecureStore.setItemAsync(DEVICE_ID, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
