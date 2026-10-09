const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

describe('AGNI owner command center Phase 2 contract', () => {
  test('home exposes live health, approvals, attention and owner actions', () => {
    const home = read('app/(tabs)/index.tsx');
    expect(home).toContain('OVERALL SYSTEM HEALTH');
    expect(home).toContain('PENDING APPROVALS');
    expect(home).toContain('ATTENTION');
    expect(home).toContain('ASK AGNI');
    expect(home).toContain('SYSTEMS');
    expect(home).toContain('INCIDENTS');
    expect(home).toContain('APPROVALS');
  });

  test('chat separates routine ask, diagnosis and deeper investigation', () => {
    const chat = read('app/(tabs)/chat.tsx');
    expect(chat).toContain("type ChatMode = 'ASK' | 'DIAGNOSE' | 'INVESTIGATE'");
    expect(chat).toContain('routing minimum context');
    expect(chat).toContain('PREPARE FIX');
    expect(chat).toContain('safeCode');
    expect(chat).toContain('VOICE LINK // UI READY');
  });

  test('systems provide owner-safe drilldowns instead of dead cards', () => {
    const systems = read('app/(tabs)/systems.tsx');
    const detail = read('app/system/[system].tsx');
    expect(systems).toContain("pathname: '/system/[system]'");
    expect(systems).toContain('VIEW DETAILS');
    expect(systems).toContain('ASK AGNI');
    expect(detail).toContain('OWNER-SAFE LIVE TELEMETRY');
    expect(detail).toContain('OPEN INCIDENTS');
  });

  test('incidents support active, resolved and all with governed actions', () => {
    const incidents = read('app/(tabs)/incidents.tsx');
    expect(incidents).toContain("type IncidentTab = 'open' | 'resolved' | 'all'");
    expect(incidents).toContain('INVESTIGATE');
    expect(incidents).toContain('PREPARE FIX');
    expect(incidents).toContain("intent: 'INVESTIGATE'");
    expect(incidents).toContain("intent: 'PREPARE_FIX'");
  });

  test('the final orange-fire blue-HUD yellow-lightning palette is locked', () => {
    const theme = read('lib/theme.ts');
    expect(theme).toContain("fire: '#FF6A00'");
    expect(theme).toContain("blueBright: '#42A5FF'");
    expect(theme).toContain("lightning: '#FFD43B'");
    expect(theme).toContain("mono:");
  });
});
