/**
 * Lighthouse (mobile by default) against a running production build.
 *
 *   npm run build && npx next start -p 4500
 *   node scripts/lighthouse.mjs http://localhost:4500/ [label] [--desktop]
 *
 * Prints the four category scores, the key metrics and every failing audit
 * in the accessibility, best-practices and SEO categories. Exits non-zero
 * below the budget: performance 90, the other three 100, CLS 0.
 */
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const [url, labelArg] = process.argv.slice(2);
const label = labelArg && !labelArg.startsWith('--') ? labelArg : url;
const desktop = process.argv.includes('--desktop');
const budget = { performance: 90, accessibility: 100, 'best-practices': 100, seo: 100 };

const chrome = await launch({ chromePath: process.env.CHROME_PATH || '/home/belal/.cache/puppeteer/manual/chrome', chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
const { lhr } = await lighthouse(url, {
  port: chrome.port,
  output: 'json',
  logLevel: 'error',
  onlyCategories: Object.keys(budget),
  formFactor: desktop ? 'desktop' : 'mobile',
  screenEmulation: desktop ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false } : { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
  ...(desktop ? { throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } : {}),
});
await chrome.kill();

let failed = false;
console.log(`\n=== ${label} (${desktop ? 'desktop' : 'mobile'}) ===`);
for (const [key, min] of Object.entries(budget)) {
  const score = Math.round(lhr.categories[key].score * 100);
  if (score < min) failed = true;
  console.log(`  ${key.padEnd(16)} ${String(score).padStart(3)}${score < min ? `  FAIL (< ${min})` : ''}`);
}
const a = lhr.audits;
for (const k of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'])
  console.log(`  ${k.padEnd(28)} ${a[k].displayValue}`);
const lcpItems = a['largest-contentful-paint-element']?.details?.items ?? [];
for (const block of lcpItems) for (const item of block.items ?? []) console.log(`  LCP ${item.node ? 'element: ' + item.node.snippet.slice(0, 120) : (item.phase ?? '') + ' ' + Math.round(item.timing ?? 0) + ' ms'}`);
if (process.argv.includes('--why'))
  for (const audit of Object.values(a)) if (audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 0.9) console.log(`  ~ ${audit.id}: ${audit.displayValue ?? ''}`);
if (a['cumulative-layout-shift'].numericValue > 0) {
  failed = true;
  console.log('  CLS is not 0');
}
for (const key of ['accessibility', 'best-practices', 'seo'])
  for (const ref of lhr.categories[key].auditRefs) {
    const audit = a[ref.id];
    if (ref.weight > 0 && audit.score !== null && audit.score < 1) {
      console.log(`  ✗ [${key}] ${audit.id}: ${audit.title}`);
      for (const item of (audit.details?.items ?? []).slice(0, 4)) console.log(`      ${item.node?.snippet ?? item.source?.url ?? JSON.stringify(item).slice(0, 160)}`);
    }
  }
if (failed) process.exitCode = 1;
