const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

describe('AGNI owner command center Phase 1 contract', () => {
  test('locks the approved fire + thunder identity', () => {
    const theme = read('lib/theme.ts');
    const mark = read('components/AgniMark.tsx');

    expect(theme).toContain("fire: '#FF6A00'");
    expect(theme).toContain("blueBright: '#42A5FF'");
    expect(theme).toContain("purple: '#9D4DFF'");
    expect(mark).toContain('name="flame"');
    expect(mark).toContain('name="flash"');
  });

  test('locks the five-tab owner command center navigation', () => {
    const tabs = read('app/(tabs)/_layout.tsx');

    for (const route of ['index', 'chat', 'systems', 'incidents', 'more']) {
      expect(tabs).toContain(`name="${route}"`);
    }
    expect(tabs).toContain('name="approvals" options={{ href: null }}');
  });

  test('keeps the retro terminal shell and neon primitives present', () => {
    const screen = read('components/CommandScreen.tsx');
    const panel = read('components/NeonPanel.tsx');
    const header = read('components/ScreenHeader.tsx');

    expect(screen).toContain('LinearGradient');
    expect(screen).toContain('gridLine');
    expect(panel).toContain('toneGradient');
    expect(header).toContain('AGNI // OWNER CONSOLE');
  });
});
