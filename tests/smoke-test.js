/* N Space functional smoke test — run: npm i jsdom && node tests/smoke-test.js */
const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  url: 'http://localhost:8000/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
});
const { window } = dom;
window.addEventListener('error', e => errors.push('window error: ' + e.message));
// Stubs jsdom lacks
window.URL.createObjectURL = () => 'blob:stub';
window.URL.revokeObjectURL = () => {};
window.Element.prototype.scrollIntoView = function(){};
window.Element.prototype.scrollTo = function(){};
window.speechSynthesis = { cancel(){}, speak(){} };

try {
  const vendor = fs.readFileSync(path.join(__dirname, '..', 'vendor', 'qrcode.js'), 'utf8');
  const vs = window.document.createElement('script'); vs.textContent = vendor;
  window.document.body.appendChild(vs);
} catch(e) { console.log('vendor qrcode not loaded:', e.message); }
const script = window.document.createElement('script');
script.textContent = js;
try { window.document.body.appendChild(script); console.log('BOOT: app.js executed'); }
catch (e) { errors.push('boot throw: ' + e.message); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await sleep(300);
  const d = window.document;
  const assert = (cond, label) => console.log((cond ? 'PASS' : 'FAIL') + ' — ' + label) || (!cond && errors.push(label));

  assert(d.querySelectorAll('.agent-node').length === 10, 'Orbit renders 10 agent nodes incl. Agent Nova + Tanya (got ' + d.querySelectorAll('.agent-node').length + ')');
  assert(d.querySelectorAll('#activityList .act-item').length >= 5, 'Activity feed populated');
  assert(d.querySelectorAll('#execLog li').length >= 6, 'Execution log seeded');
  assert(d.querySelectorAll('#pdfMiniList .pdf-row').length >= 1, 'Right-panel PDF mini list rendered');
  assert(d.getElementById('statApplicants').textContent === '248', 'Stats computed (248 applicants)');
  assert(d.getElementById('modal').hidden && d.getElementById('cmdk').hidden && d.getElementById('toast').hidden, 'Overlays start hidden on load: modal, command palette, toast');

  const views = ['dashboard','chats','agents','browser','applicants','applications','documents','cases','recruitment','crm','partners','pdf','knowledge','skills','automations','reports','settings','nova'];
  for (const v of views) {
    // switchView is not exported; click the nav button instead
    const btn = d.querySelector(`.nav-item[data-view="${v}"]`);
    btn.click(); await sleep(30);
    const dyn = d.getElementById('view-dynamic');
    assert(!dyn.hidden && dyn.innerHTML.length > 200, `View renders: ${v}`);
  }
  d.querySelector('.nav-item[data-view="applicants"]').click(); await sleep(30);
  assert(d.querySelectorAll('#apBody tr').length === 6, 'Applicants table: 6 seeded rows');

  // Chat brain (local intent routing)
  d.querySelector('.nav-item[data-view="chats"]').click(); await sleep(30);
  const input = d.getElementById('chatInput');
  input.value = 'Check visa status for Md. Ariful Islam.';
  d.getElementById('sendBtn').click();
  await sleep(2400);
  const bubbles = [...d.querySelectorAll('#chatThread .bubble')].map(b => b.textContent);
  assert(bubbles.some(t => t.includes('Md. Ariful Islam') && t.includes('68%')), 'Chat: visa-status intent answered with live data');

  // ---- v1.1: Agent Nova ----
  d.querySelector('.nav-item[data-view="nova"]').click(); await sleep(60);
  assert(d.querySelectorAll('#novaCanvas .a4-page').length === 2, 'Nova: editorial dossier renders 2 A4 pages');
  assert(!!d.querySelector('#novaCanvas .dos-seal'), 'Nova: holographic seal present');
  assert(!!d.querySelector('#novaCanvas .dos-qr svg'), 'Nova: QR code rendered (real generator)');
  assert((d.querySelector('#novaCanvas .dos-seal')?.textContent||'').includes('VM-'), 'Nova: dynamic VM- reference on seal');
  assert(d.querySelectorAll('#novaCanvas .dos-step').length === 5, 'Nova: 5-step milestone timeline');
  const novaLogic = window.eval(`(() => {
    const f = fieldsFromText('Passport BD1234567 DOB 14 Mar 1998');
    const d2 = Nova_TEMPLATES.schengen.make(DB.applicants[1]);
    DB.dossiers.unshift(d2); novaActiveId = d2.id;
    const p = saveDossierToPdfCenter(d2);
    const lines = pdfLinesFor(p).join(' ');
    return f.passport === 'BD1234567' && d2.ref.startsWith('VM-') && lines.includes(d2.ref) && p.kind === 'Dossier';
  })()`);
  assert(novaLogic, 'Nova: field mapping + template + PDF Center save pipeline');
  const qrReal = window.eval(`typeof qrcode === 'function' && qrSVG('https://nspace.app/verify/VM-TEST01').includes('<svg')`);
  assert(qrReal, 'Nova: vendored QR generator produces SVG');

  // ---- v1.1: browser sessions + transport + mobile shell ----
  assert(d.querySelectorAll('#sessionSelect option').length >= 1, 'Browser: session switcher populated');
  assert(!!d.getElementById('taskPlayBtn') && !!d.getElementById('taskStepBtn') && !!d.getElementById('taskReplayBtn'), 'Browser: play/pause/step/replay transport present');
  assert(d.querySelectorAll('.mobile-nav').length === 0, 'Mobile: NO bottom nav bar — sidebar drawer is the only navigation');
  const sideLabels = [...d.querySelectorAll('.sidebar .nav-item span')].map(x=>x.textContent.trim());
  assert(sideLabels.includes('Knowledge') && sideLabels.includes('Skills') && sideLabels.includes('Nova Studio'), 'Sidebar: Knowledge, Skills & Nova Studio present for all devices');
  assert(!d.querySelector('.hero-img'), 'Declutter: photo hero removed');
  d.querySelector('.nav-item[data-view="home"]')?.click(); await sleep(30);
  assert(d.querySelectorAll('.quiet-stats .qstat').length === 4, 'Declutter: home stats are one quiet row');

  // Browser transport: Step from idle executes exactly one step, Stop resets
  d.getElementById('taskStepBtn').click(); await sleep(200);
  assert(d.getElementById('taskStep').textContent === '1/7', 'Browser: Step mode executed 1/7 steps and paused');
  assert(d.getElementById('taskPlayLabel').textContent === 'Resume', 'Browser: transport shows Resume while paused');
  d.getElementById('taskStopBtn').click(); await sleep(80);
  assert(d.getElementById('taskPlayLabel').textContent === 'Run', 'Browser: Stop resets transport to Run');

  // Cloner: real text-layer extraction from a generated PDF + URL knowledge matching
  const extractOk = await window.eval(`(async () => {
    const blob = makeRealPdf('Clone Test', ['Passport BD1234567', 'Checklist item one']);
    const f = new File([blob], 'source.pdf', {type:'application/pdf'});
    const t = await extractPdfText(f);
    return t.includes('BD1234567');
  })()`);
  assert(extractOk, 'Cloner: extracts real text layer from PDF bytes');
  assert(window.eval(`URL_KB.some(k=>k.match.test('https://immi.homeaffairs.gov.au')) && URL_KB.some(k=>k.match.test('https://visa.mofa.gov.sa')) && URL_KB.some(k=>k.match.test('https://www.vfsglobal.com'))`), 'URL Importer: AU / Saudi MOFA / VFS knowledge matched');

  // ---- v1.2: Serbia statutory dossier (7 pages, DRAFT template) + portals ----
  const SerbiaMade = window.eval(`(() => { const d = createSerbiaDossier(DB.applicants[0]); return d.kind === 'serbia' && d.ref.startsWith('VM-'); })()`);
  assert(SerbiaMade, 'Serbia: statutory dossier created');
  d.querySelector('.nav-item[data-view="nova"]').click(); await sleep(60);
  assert(d.querySelectorAll('#novaCanvas .legal-page').length === 7, 'Serbia: exactly 7 A4 legal pages (got ' + d.querySelectorAll('#novaCanvas .legal-page').length + ')');
  const legalText = (d.querySelector('#novaCanvas')?.textContent || '').toUpperCase();
  assert(legalText.includes('ПОЗИВНО') && legalText.includes('UGOVOR O RADU') && legalText.includes('ČLAN 27'), 'Serbia: invitation + 27-article contract rendered');
  assert(d.querySelectorAll('#novaCanvas .draft-tag').length === 7, 'Serbia: every page carries NACRT/DRAFT marking');
  assert(d.querySelectorAll('[data-portal]').length === 8, 'Portals: 8-nation quick-dispatcher rendered');
  assert(window.eval(`DB.knowledge.some(k=>/Serbia/.test(k.title)) && DB.skills.some(k=>/Statutory/.test(k.name))`), 'v1.2 seed: Serbia guide in Knowledge + statutory Skill added');
  d.querySelector('.nav-item[data-view="home"]')?.click(); await sleep(30);

  // Regression: [hidden] must always win over component display rules,
  // otherwise modal/cmdk/toast overlays appear on page load (blank "Title" modal bug).
  const cssText = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert(cssText.includes('[hidden]{display:none!important}'), 'CSS guard: [hidden] display reset present (overlays stay closed on load)');
  assert(d.getElementById('modal').hidden && d.getElementById('cmdk').hidden, 'Overlays closed during flows: modal & command palette');

  // Persistence
  const saved = JSON.parse(window.localStorage.getItem('nspace_v1'));
  assert(saved && saved.chats.length >= 3 && saved.applicants.length === 6, 'localStorage persistence (chats + applicants)');

  // Real PDF bytes
  const pdfBlobOk = window.eval(`(async () => {
      const p = DB.pdfs[0];
      const blob = makeRealPdf('Test', pdfLinesFor(p));
      const buf = await blob.arrayBuffer();
      const head = new TextDecoder().decode(buf.slice(0, 8));
      return head.startsWith('%PDF-1.4') && buf.byteLength > 800;
  })()`);
  assert(await pdfBlobOk, 'PDF engine produces valid %PDF-1.4 bytes');

  // Command palette
  window.eval('openCmdk()');
  assert(!d.getElementById('cmdk').hidden && d.querySelectorAll('.cmdk-item').length > 5, 'Command palette opens with items');
  window.eval('closeCmdk()');

  console.log('\nERRORS:', errors.length ? errors : 'none');
  process.exit(errors.length ? 1 : 0);
})();
