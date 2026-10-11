const fs=require('node:fs');
const path=require('node:path');
const read=(p)=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
describe('AGNI Android Phase 12 owner-only evidence surface',()=>{
 test('button-only API check, no background poll and no mutate call',()=>{
  const page=read('app/(tabs)/certification.tsx');
  expect(page).toContain("enabled: false");
  expect(page).toContain("retry: false");
  expect(page).toContain("review.refetch()");
  expect(page).toContain('approvedForL4 === false');
  expect(page).toContain("executionAuthority === 'NONE'");
  expect(page).toContain('report.gates?.length === 16');
  expect(page).not.toContain('refetchInterval');
  expect(page).not.toContain("method: 'POST'");
 });
 test('API uses existing bounded authenticated request and no separate owner key',()=>{
  const api=read('lib/api.ts');
  expect(api).toContain("request<Phase12Certification>('/v2/owner/phase12-certification')");
  expect(api).toContain("headers.set('authorization', `Bearer ${token}`)");
 });
 test('More nav points to hidden Phase12 route',()=>{
  const more=read('app/(tabs)/more.tsx'),tabs=read('app/(tabs)/_layout.tsx');
  expect(more).toContain('Phase 12 Certification');
  expect(more).toContain("router.push('/(tabs)/certification')");
  expect(tabs).toContain('name="certification" options={{ href: null }}');
 });
 test('signed release manifest version is internally consistent',()=>{
  const app=JSON.parse(read('app.json')).expo;
  const pkg=JSON.parse(read('package.json'));
  const workflow=read('.github/workflows/android-release-apk.yml');
  expect(app.version).toBe('0.3.1');
  expect(pkg.version).toBe('0.3.1');
  expect(app.android.versionCode).toBe(4);
  expect(workflow).toContain('AGNI-v0.3.1-private-release.apk');
  expect(workflow).toContain('--arg version "0.3.1"');
  expect(workflow).toContain('--argjson versionCode 4');
  expect(workflow).not.toContain('AGNI-v0.3.0-private-release');
 });
});
