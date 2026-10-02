/**
 * run-all.mjs öz-testi — çalıştırıcının hata durumlarını sahte testlerle dener.
 *
 * Kullanım:
 *   node run-all.selftest.mjs
 *
 * Denenen durumlar:
 *   - bir test başarısız → diğerleri yine çalışır, genel kod 1
 *   - bir test çöker → "başarısız (çöktü)", diğerleri çalışır
 *   - bir test zaman aşımına uğrar → "çalıştırılamadı (zaman aşımı)", genel kod 2
 *   - zorunlu test çalıştırılamadı → genel kod 2
 *   - başarısız + çalıştırılamadı birlikte → genel kod 1, ikisi de sonuç dosyasında
 *   - zorunlu olmayan test başarısız → genel kodu etkilemez
 *   - cikti_formati: figma → HTML testleri uygulanamaz, genel kod 0, not "Figma doğrulaması ayrıca gerekli"
 *   - project-state.md yok → zorunlu testler çalıştırılamadı, genel kod 2
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const HERE = import.meta.dirname;
const FAKE = resolve(HERE, 'fixtures', 'runner', 'fake');
const tmp = mkdtempSync(join(tmpdir(), 'ldf-runner-'));
let failures = 0;

function runAll(name, { suite, root, extra = [] }) {
  const out = join(tmp, `${name}.json`);
  const args = [join(HERE, 'run-all.mjs'), '--root', root, '--out', out, ...extra];
  if (suite) {
    const suitePath = join(tmp, `${name}.suite.json`);
    writeFileSync(suitePath, JSON.stringify(suite.map(([n, required]) => ({ name: n, script: join(FAKE, `${n}.mjs`), required }))));
    args.push('--suite', suitePath);
  }
  const res = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { code: res.status, report: JSON.parse(readFileSync(out, 'utf8')), stdout: res.stdout };
}

function check(name, cond, detail) {
  console.log(`  ${cond ? '[GEÇTİ]    ' : '[BAŞARISIZ]'} ${name}${cond ? '' : ` — ${detail}`}`);
  if (!cond) failures++;
}

const statusOf = (report, n) => report.tests.find(t => t.name === n)?.status;

// Sahte testler proje köküne bakmaz; kök olarak boş bir dizin yeterli
const emptyRoot = mkdtempSync(join(tmp, 'root-'));

{
  const { code, report } = runAll('fail-continues', { root: emptyRoot, suite: [['fail', true], ['pass', true]] });
  check('başarısız test sonrası diğerleri çalışıyor', statusOf(report, 'pass') === 'passed', JSON.stringify(report.tests));
  check('başarısız → genel kod 1', code === 1, `kod ${code}`);
  check('engelleyen bulgu sonuç dosyasında', report.blocking_findings === 1, `blocking ${report.blocking_findings}`);
}
{
  const { code, report } = runAll('crash', { root: emptyRoot, suite: [['crash', true], ['pass', true]] });
  const t = report.tests.find(x => x.name === 'crash');
  check('çöken test "başarısız (çöktü)"', t.status === 'failed' && /çöktü/.test(t.reason), JSON.stringify(t));
  check('çökme sonrası diğerleri çalışıyor', statusOf(report, 'pass') === 'passed', '');
  check('çökme → genel kod 1', code === 1, `kod ${code}`);
}
{
  const { code, report } = runAll('timeout', { root: emptyRoot, suite: [['hang', true], ['pass', true]], extra: ['--timeout', '2'] });
  const t = report.tests.find(x => x.name === 'hang');
  check('takılan test "çalıştırılamadı (zaman aşımı)"', t.status === 'not_run' && /zaman aşımı/.test(t.reason), JSON.stringify(t));
  check('zaman aşımı sonrası diğerleri çalışıyor', statusOf(report, 'pass') === 'passed', '');
  check('zaman aşımı → genel kod 2 (başarılı değil)', code === 2, `kod ${code}`);
}
{
  const { code } = runAll('notrun', { root: emptyRoot, suite: [['notrun', true], ['pass', true]] });
  check('zorunlu test çalıştırılamadı → genel kod 2', code === 2, `kod ${code}`);
}
{
  const { code, report } = runAll('mixed', { root: emptyRoot, suite: [['notrun', true], ['fail', true]] });
  check('başarısız + çalıştırılamadı → genel kod 1', code === 1, `kod ${code}`);
  check('karma durumda iki ayrıntı da sonuç dosyasında',
    statusOf(report, 'notrun') === 'not_run' && statusOf(report, 'fail') === 'failed', JSON.stringify(report.tests));
}
{
  const { code } = runAll('optional', { root: emptyRoot, suite: [['fail', false], ['pass', true]] });
  check('zorunlu olmayan test başarısız → genel kod 0', code === 0, `kod ${code}`);
}

// Gerçek testlerle: uygulanabilirlik project-state.md'den
const figmaRoot = mkdtempSync(join(tmp, 'figma-'));
writeFileSync(join(figmaRoot, 'project-state.md'), '# Deneme — Project State\n\ncikti_formati: figma\nplatform: web\n');
{
  const { code, report } = runAll('figma', { root: figmaRoot });
  const required = report.tests.filter(t => t.required);
  check('figma: tüm HTML testleri uygulanamaz', report.tests.every(t => t.status === 'not_applicable'), JSON.stringify(report.tests.map(t => [t.name, t.status])));
  check('figma: genel kod 0', code === 0, `kod ${code}`);
  check('figma: not "Figma doğrulaması ayrıca gerekli"', report.notes.some(n => n.includes('Figma doğrulaması ayrıca gerekli')), JSON.stringify(report.notes));
  check('figma: zorunlu test sayısı > 0', required.length > 0, '');
}
rmSync(join(figmaRoot, 'project-state.md'));
{
  const { code, report } = runAll('no-state', { root: figmaRoot });
  check('project-state.md yok: zorunlu testler çalıştırılamadı',
    report.tests.filter(t => t.required).every(t => t.status === 'not_run'), JSON.stringify(report.tests.map(t => [t.name, t.status])));
  check('project-state.md yok: genel kod 2', code === 2, `kod ${code}`);
}

rmSync(tmp, { recursive: true, force: true });
console.log(`\n${failures === 0 ? 'Tüm durumlar geçti.' : `${failures} durum başarısız.`}`);
process.exit(failures === 0 ? 0 : 1);
