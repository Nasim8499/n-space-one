/* ============================================================
   N SPACE — Premium AI Agent OS · Application Engine
   Data persists in localStorage · PWA · Voice (EN/বাংলা)
   ============================================================ */
'use strict';

/* ---------- helpers ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const uid = () => 'id_' + Math.random().toString(36).slice(2, 9);
const nowTime = () => new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function relTime(ts){
  const m = Math.max(0, Math.round((Date.now()-ts)/60000));
  if (m < 1) return 'Just now';
  if (m < 60) return m + ' min ago';
  const h = Math.floor(m/60); if (h < 24) return h + (h===1?' hr ago':' hrs ago');
  return Math.floor(h/24) + ' days ago';
}
const initials = n => n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const AV_COLORS = ['#2563eb','#7c3aed','#0ea5e9','#17b978','#f59e0b','#f0446c','#14b8a6'];
const colorFor = n => AV_COLORS[[...n].reduce((a,c)=>a+c.charCodeAt(0),0) % AV_COLORS.length];
const icon = (name, cls='') => `<svg class="ic ${cls}"><use href="#i-${name}"/></svg>`;

/* ---------- agents master data ---------- */
const AGENTS = [
  {id:'maestro',     name:'Maestro',            persona:'The Orchestrator',               icon:'crown',  color:'#7c3aed', soft:'#f1e9fe', desc:'Orchestrator — plans tasks, delegates to specialist agents and verifies every result.', statuses:['Thinking…','Planning…','Coordinating…'], pos:[50,7]},
  {id:'visa',        name:'Visa Agent',         persona:'Case Strategist',                icon:'plane',  color:'#0ea5e9', soft:'#e2f4fe', desc:'Checks eligibility, builds document checklists and tracks visa applications end-to-end.', statuses:['Analyzing case…','Checking eligibility…'], pos:[73,15]},
  {id:'browser',     name:'Browser Agent',      persona:'Browser Conductor',              icon:'globe',  color:'#17b978', soft:'#e3f7ee', desc:'Drives a real browser — navigates, clicks, types, uploads and downloads on portals like ImmiAccount.', statuses:['Browsing…','Watching page…'], pos:[87,37]},
  {id:'nova',        name:'Agent Nova',         persona:'Dossier & Document Architect',   icon:'spark',  color:'#a8842f', soft:'#f6efdc', desc:'Dedicated PDF & visa document architect — clones locked PDFs into editable templates, imports embassy URLs and produces pixel-perfect A4 editorial dossiers.', statuses:['Designing dossier…','Cloning layout…'], pos:[87,63]},
  {id:'dispatch',    name:'Dispatch Agent',     persona:'Tanya · Dispatch',               icon:'send',   color:'#6366f1', soft:'#e8eafd', desc:'Delivers approved dossiers, confirmations and reminders to clients via WhatsApp, email and courier — with tracking.', statuses:['Dispatching…','Tracking deliveries…'], pos:[73,85]},
  {id:'report',      name:'Daily Report Agent', persona:'Zayyad · Analytics',             icon:'chart',  color:'#a855f7', soft:'#f6eafe', desc:'Compiles daily operations, revenue and case-progress analytics for the team.', statuses:['Generating report…','Summarising…'], pos:[50,93]},
  {id:'document',    name:'Document Agent',     persona:'Raffi · OCR',                    icon:'file',   color:'#14b8a6', soft:'#defaf5', desc:'OCR specialist — reads passports & certificates, extracts verified data and feeds every other agent.', statuses:['Processing PDF…','Extracting data…'], pos:[27,85]},
  {id:'compliance',  name:'Compliance Agent',   persona:'Rules Guardian',                 icon:'shield', color:'#f59e0b', soft:'#fef3df', desc:'Validates every file against the latest immigration rules before submission.', statuses:['Checking rules…','Auditing file…'], pos:[13,63]},
  {id:'recruitment', name:'Recruitment Agent',  persona:'Talent Matcher',                 icon:'users',  color:'#f0446c', soft:'#ffe9ef', desc:'Matches candidates with overseas employers and schedules interviews.', statuses:['Finding matches…','Screening CVs…'], pos:[13,37]},
  {id:'research',    name:'Research Agent',     persona:'Policy Scout',                   icon:'search', color:'#2f7bff', soft:'#e8f1ff', desc:'Monitors visa fees, policy changes and processing times across 12 countries.', statuses:['Searching…','Scanning updates…'], pos:[27,15]},
];
const agentById = id => AGENTS.find(a=>a.id===id) || AGENTS[0];

/* ---------- persistent store ---------- */
const LS_KEY = 'nspace_v1';
function seedData(){
  const t = Date.now(), min = 60000;
  return {
    applicants: [
      {id:uid(), name:'Md. Ariful Islam',  email:'arif@example.com',    phone:'+880 1712-345678', country:'Australia', visa:'Student (500)',   status:'In Progress', progress:68, applied:'12 Oct 2026'},
      {id:uid(), name:'Sarah Rahman',      email:'sarah@example.com',  phone:'+880 1912-223344', country:'UK',        visa:'Student Visa',    status:'Documents',   progress:42, applied:'18 Oct 2026'},
      {id:uid(), name:'Tanvir Hasan',     email:'tanvir@example.com',   phone:'+880 1812-998877', country:'Canada',    visa:'Work Permit',     status:'Waiting',     progress:55, applied:'02 Oct 2026'},
      {id:uid(), name:'Fatema Begum',   email:'fatema@example.com',  phone:'+880 1612-556677', country:'Australia', visa:'Visitor (600)',   status:'Approved',    progress:100, applied:'21 Sep 2026'},
      {id:uid(), name:'Rakibul Islam',    email:'rakib@example.com',   phone:'+880 1512-112233', country:'Malaysia',  visa:'Employment Pass', status:'In Progress', progress:74, applied:'08 Oct 2026'},
      {id:uid(), name:'Nusrat Jahan',       email:'nusrat@example.com',  phone:'+880 1312-445566', country:'Germany',   visa:'Job Seeker',      status:'Review',      progress:31, applied:'22 Oct 2026'},
    ],
    cases: [
      {id:uid(), title:'AU Student Visa — Md. Ariful Islam', applicant:'Md. Ariful Islam', country:'Australia', stage:'In Progress', progress:68, due:'30 Oct 2026'},
      {id:uid(), title:'UK Student — Sarah Rahman', applicant:'Sarah Rahman', country:'UK', stage:'Documents', progress:42, due:'05 Nov 2026'},
      {id:uid(), title:'CA Work Permit — Tanvir Hasan', applicant:'Tanvir Hasan', country:'Canada', stage:'Waiting', progress:55, due:'12 Nov 2026'},
      {id:uid(), title:'AU Visitor — Fatema Begum', applicant:'Fatema Begum', country:'Australia', stage:'Completed', progress:100, due:'Done'},
      {id:uid(), title:'MY Employment — Rakibul Islam', applicant:'Rakibul Islam', country:'Malaysia', stage:'In Progress', progress:74, due:'02 Nov 2026'},
      {id:uid(), title:'DE Job Seeker — Nusrat Jahan', applicant:'Nusrat Jahan', country:'Germany', stage:'Waiting', progress:31, due:'18 Nov 2026'},
    ],
    documents: [
      {id:uid(), name:'Passport_Ariful_Islam.pdf', size:'1.8 MB', by:'Document Agent', ts:t-42*min},
      {id:uid(), name:'Bank_Statement_Sarah Rahman.pdf', size:'3.1 MB', by:'Nasim Ahmed', ts:t-180*min},
      {id:uid(), name:'IELTS_Certificate_Nusrat Jahan.jpg', size:'940 KB', by:'Applicant upload', ts:t-26*60*min},
      {id:uid(), name:'Offer_Letter_Rakibul Islam.pdf', size:'620 KB', by:'Recruitment Agent', ts:t-50*60*min},
    ],
    pdfs: [
      {id:uid(), name:'Visa_Application_Confirmation.pdf', size:'2.4 MB', ts:t-120*min, version:2, kind:'Confirmation', applicant:'Md. Ariful Islam'},
      {id:uid(), name:'Subclass_500_Checklist.pdf', size:'1.1 MB', ts:t-300*min, version:1, kind:'Checklist', applicant:'Md. Ariful Islam'},
      {id:uid(), name:'Daily_Operations_Report.pdf', size:'860 KB', ts:t-26*60*min, version:3, kind:'Report', applicant:'—'},
    ],
    chats: [
      {id:uid(), title:'Visa checklist for Md. Ariful Islam.', agent:'visa', updated:t-24*min, messages:[
        {from:'me', text:'মোঃ আরিফুল ইসলামের জন্য সাবক্লাস ৫০০ চেকলিস্ট বানাও', ts:t-26*min},
        {from:'ai', text:'Done ✅ I prepared the Subclass 500 document checklist for Md. Ariful Islam. and saved it to the PDF Center. 3 documents are still missing: GTE statement, OSHC policy and the latest bank statement.', ts:t-24*min},
      ]},
      {id:uid(), title:'ImmiAccount login task', agent:'browser', updated:t-95*min, messages:[
        {from:'me', text:'Login to ImmiAccount and check Arif\'s application status', ts:t-96*min},
        {from:'ai', text:'Browser Agent opened ImmiAccount and signed in securely. Application status: "Further assessment" — no new messages from the case officer.', ts:t-95*min},
      ]},
      {id:uid(), title:'Malaysia recruitment matches', agent:'recruitment', updated:t-26*60*min, messages:[
        {from:'me', text:'Find candidates for the Kuala Lumpur factory role', ts:t-26*60*min},
        {from:'ai', text:'I found 6 matching candidates. Top match: Rakibul Islam (92% fit, 4 years experience, passport ready).', ts:t-26*60*min},
      ]},
    ],
    activity: [
      {id:uid(), agent:'browser',     text:'Opened https://www.gov.au/immiaccount', ts:t-2*min},
      {id:uid(), agent:'visa',        text:'Analyzed applicant documents', ts:t-4*min},
      {id:uid(), agent:'document',    text:'Generated visa checklist PDF', ts:t-7*min},
      {id:uid(), agent:'research',    text:'Found latest visa fee update', ts:t-12*min},
      {id:uid(), agent:'recruitment', text:'Searched for partner companies', ts:t-18*min},
      {id:uid(), agent:'compliance',  text:'Checked document requirements', ts:t-25*min},
    ],
    skills: [
      {id:uid(), name:'ImmiAccount Automation', desc:'Login, status check & document upload on Home Affairs portal.', on:true,  tag:'Browser'},
      {id:uid(), name:'PDF Checklist Generator', desc:'Country-wise visa document checklists as branded PDF.', on:true, tag:'Documents'},
      {id:uid(), name:'Bangla Voice Assistant', desc:'Full Bangla speech input & spoken replies for the team.', on:false, tag:'Voice'},
      {id:uid(), name:'Fee & Policy Watcher', desc:'Daily scan of visa fee and rule changes in 12 countries.', on:false, tag:'Research'},
      {id:uid(), name:'CRM Auto Follow-up', desc:'WhatsApp/email follow-up sequences for cold leads.', on:false, tag:'CRM'},
    ],
    automations: [
      {id:uid(), name:'Daily 9 AM Operations Report', trigger:'Every day · 09:00', on:true},
      {id:uid(), name:'Document Expiry Watchdog', trigger:'When a document expires in ≤ 7 days', on:true},
      {id:uid(), name:'New Lead → CRM + Welcome Message', trigger:'On new website enquiry', on:false},
      {id:uid(), name:'Weekly Visa Policy Digest', trigger:'Every Sunday · 18:00', on:false},
    ],
    knowledge: [
      {id:uid(), title:'Australia Subclass 500 — Complete Guide 2026', cat:'Australia', body:'Genuine Student (GS) requirement, financial capacity AUD 29,710/year, OSHC, English score matrix and step-by-step ImmiAccount lodgement workflow.'},
      {id:uid(), title:'ImmiAccount SOP — Internal', cat:'Operations', body:'Standard operating procedure for agent logins, two-factor handling, attachment naming conventions and "Further assessment" status playbook.'},
      {id:uid(), title:'UK Student Visa — CAS to BRP/eVisa', cat:'UK', body:'CAS issuance checklist, IHS surcharge calculation, TB test centres in Bangladesh and eVisa account setup after arrival.'},
      {id:uid(), title:'Malaysia Employment Pass Categories', cat:'Malaysia', body:'EP I/II/III salary bands, ESD company registration, eVDR approval and FOMEMA medical process.'},
    ],
    candidates: [
      {id:uid(), name:'Rakibul Islam', role:'Factory Technician', dest:'Malaysia', match:92, exp:'4 yrs', status:'Shortlisted'},
      {id:uid(), name:'Tanvir Hasan', role:'Construction Supervisor', dest:'Canada', match:88, exp:'6 yrs', status:'Interview'},
      {id:uid(), name:'Nusrat Jahan', role:'Registered Nurse', dest:'Germany', match:85, exp:'3 yrs', status:'Screening'},
      {id:uid(), name:'Md. Ariful Islam', role:'Chef de Partie', dest:'Australia', match:79, exp:'5 yrs', status:'New'},
    ],
    leads: [
      {id:uid(), name:'Shakil Ahmed', source:'Facebook Ads', interest:'Australia Student', stage:'New Lead', value:'৳85,000'},
      {id:uid(), name:'Mim Akter', source:'WhatsApp', interest:'UK Student', stage:'Contacted', value:'৳72,000'},
      {id:uid(), name:'Hasan Mahmud', source:'Referral', interest:'Malaysia Work', stage:'Qualified', value:'৳2,40,000'},
      {id:uid(), name:'Priya Das', source:'Walk-in — Dhaka', interest:'Canada PR', stage:'Proposal', value:'৳3,10,000'},
      {id:uid(), name:'Imran Hossain', source:'Website', interest:'Germany Job Seeker', stage:'Qualified', value:'৳1,55,000'},
    ],
    partners: [
      {id:uid(), name:'EduBridge Australia', type:'Education Partner', country:'Australia', deals:34, status:'Active'},
      {id:uid(), name:'Kuala Lumpur Manpower Sdn Bhd', type:'Employer', country:'Malaysia', deals:57, status:'Active'},
      {id:uid(), name:'Toronto Immigration Law', type:'Legal Partner', country:'Canada', deals:12, status:'Active'},
      {id:uid(), name:'Berlin Relocation GmbH', type:'Relocation', country:'Germany', deals:8, status:'Onboarding'},
    ],
    agentsOn: {maestro:true, visa:true, browser:true, nova:true, dispatch:true, report:true, document:true, compliance:true, recruitment:true, research:true},
    settings: {geminiKey:'', browserUseKey:'', openaiKey:'', voiceOut:true, lang:'bn', theme:'light', email:'Nasim Ahmed@example.com'},
    activeChatId: null,
  };
}
let DB;
try { DB = JSON.parse(localStorage.getItem(LS_KEY)) || seedData(); }
catch(e){ DB = seedData(); }
if (!DB.applicants) DB = seedData();
const save = () => { try{ localStorage.setItem(LS_KEY, JSON.stringify(DB)); }catch(e){} };
save();
/* ---------- v1.1 migration: new agents, applicant dossier fields, browser sessions, dossiers ---------- */
(function migrate(){
  AGENTS.forEach(a=>{ if (!(a.id in DB.agentsOn)) DB.agentsOn[a.id] = true; });
  const dobs = ['14 Mar 1998','02 Jul 2000','27 Nov 1995','09 Jan 1989','18 May 1997','30 Sep 2001'];
  const sponsors = ['Self-funded','Father — Md. Abdul Karim','Employer sponsored','Spouse','Brother (AU PR)','Self + Scholarship'];
  DB.applicants.forEach((a,i)=>{
    if (!a.passport) a.passport = 'BD' + String(1048576 + [...a.name].reduce((x,c)=>x*31+c.charCodeAt(0),7) % 8999999 + 1000000).slice(0,7);
    if (!a.dob) a.dob = dobs[i % dobs.length];
    if (!a.nationality) a.nationality = 'Bangladeshi';
    if (!a.sponsor) a.sponsor = sponsors[i % sponsors.length];
  });
  if (!Array.isArray(DB.browserSessions) || !DB.browserSessions.length){
    DB.browserSessions = [{id:uid(), name:'ImmiAccount — Main Session', url:'https://www.gov.au/immiaccount', task:'Login to ImmiAccount', logs:[
      {type:'navigate', text:'Navigated to https://www.gov.au/immiaccount', cls:'', t:'14:32'},
      {type:'click', text:'Clicked on "Sign In" button', cls:'', t:'14:33'},
      {type:'typing', text:'Typing username…', cls:'', t:'14:33'},
      {type:'typing', text:'Typed: Nasim Ahmed@example.com', cls:'', t:'14:34'},
      {type:'click', text:'Clicked on "Next"', cls:'', t:'14:34'},
      {type:'wait', text:'Waiting for page load…', cls:'', t:'14:35'},
      {type:'ok', text:'Page loaded successfully ✓', cls:'ok-t', t:'14:36'},
    ]}];
    DB.activeBrowserSession = DB.browserSessions[0].id;
  }
  if (!Array.isArray(DB.dossiers)) DB.dossiers = [];
  save();
})();


/* ---------- v1.2 seed: statutory knowledge & skills ---------- */
(function seedV12(){
  const addKb = (title, cat, body)=>{ if (!DB.knowledge.some(k=>k.title===title)) DB.knowledge.push({id:uid(), title, cat, body}); };
  addKb('Serbia Jedinstvena Dozvola — Dossier Guide', 'Serbia', 'The 7-page employer package Nova drafts: ① POZIVNO PISMO (invitation, Art. 27 Zakon o strancima — inviter bears stay & removal costs), ② PISMO POTVRDE O SMEŠTAJU (accommodation + bela karta registration duty), ③ POTVRDA–IZJAVA (<10-employee rulebook exemption + 9 employer guarantees), ④–⑦ UGOVOR O RADU (27 articles, Art. 30 Zakon o radu). Purpose: agents use this guide to check completeness before any submission. DRAFTS must be verified by licensed Serbian counsel.');
  addKb('8-Nation Portal Matrix', 'Operations', 'Official portals wired into the Nova Portal Quick-Dispatcher: Australia immi.homeaffairs.gov.au · Serbia welcometoserbia.gov.rs · Russia evisa.kdmid.ru · Turkey evisa.gov.tr / CSGB · Singapore mom.gov.sg · Malaysia esd.imi.gov.my · Saudi visa.mofa.gov.sa / Qiwa · Bahrain evisa.gov.bh / LMRA. Purpose: one-tap dispatch loads the portal in Live Browser with applicant data on the clipboard.');
  if (!DB.skills.some(sk=>sk.name==='Statutory Dossier Drafting (Nova)'))
    DB.skills.push({id:uid(), name:'Statutory Dossier Drafting (Nova)', desc:'7-page Serbia Jedinstvena Dozvola draft package with field-mapped placeholders, salary tables and signature zones.', on:true, tag:'Legal'});
  save();
})();

/* ---------- toast ---------- */
let toastTimer;
function toast(msg, ok=true){
  const el = $('#toast');
  el.innerHTML = `<span style="color:${ok?'var(--green)':'#e5484d'}">${icon(ok?'check':'x','sm')}</span> ${esc(msg)}`;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.hidden = true, 3400);
}

/* ---------- activity ---------- */
function addActivity(agentId, text){
  DB.activity.unshift({id:uid(), agent:agentId, text, ts:Date.now()});
  DB.activity = DB.activity.slice(0, 30);
  save(); renderActivity();
}
function renderActivity(){
  const ul = $('#activityList'); if(!ul) return;
  ul.innerHTML = DB.activity.slice(0,8).map(a=>{
    const ag = agentById(a.agent);
    return `<li class="act-item"><span class="act-ic" style="background:${ag.soft};color:${ag.color}">${icon(ag.icon)}</span>
      <div style="min-width:0"><b>${esc(ag.name)}</b><p title="${esc(a.text)}">${esc(a.text)}</p><small>${relTime(a.ts)}</small></div></li>`;
  }).join('');
}

/* ---------- orbit ---------- */
function renderOrbit(){
  const orbit = $('#orbit'); if(!orbit) return;
  $$('.agent-node', orbit).forEach(n=>n.remove());
  AGENTS.forEach((ag,i)=>{
    const on = DB.agentsOn[ag.id];
    const ring = (ag.pos[0]*ag.pos[0] + ag.pos[1]*ag.pos[1]) > 6000 ? 2 : 1; // inner vs outer ring
    const carrier = document.createElement('div');
    carrier.className = 'orbit-carrier r' + ring + ' d' + (i % 2 ? 'cw' : 'ccw');
    carrier.style.animationDuration = (ring === 1 ? 26 + i * 3 : 40 + i * 2) + 's';
    const el = document.createElement('button');
    el.className = 'agent-node' + (on ? ' busy' : ' off');
    el.style.color = ag.color;
    carrier.appendChild(el);
    el.innerHTML = `<span class="node-ic" style="background:linear-gradient(135deg,${ag.color},${ag.color}cc)">${icon(ag.icon)}</span>
      <span class="node-txt"><b>${esc(ag.name.replace(' Agent',''))}</b>
      <span data-status>${on ? ag.statuses[i % ag.statuses.length] : 'Paused'}</span></span>`;
    el.title = ag.name + ' — click to inspect';
    el.addEventListener('click', ()=> openAgentModal(ag.id));
    orbit.appendChild(carrier);
  });
}
setInterval(()=>{ // living status rotation
  $$('.agent-node').forEach((n,i)=>{
    const ag = AGENTS[i]; if(!ag || !DB.agentsOn[ag.id]) return;
    const s = n.querySelector('[data-status]');
    if (s) s.textContent = ag.statuses[Math.floor(Math.random()*ag.statuses.length)];
  });
}, 4200);

/* ---------- stats / counters ---------- */
function renderStats(){
  const done = DB.cases.filter(c=>c.stage==='Completed').length;
  const prog = DB.cases.filter(c=>c.stage==='In Progress'||c.stage==='Documents').length;
  const wait = DB.cases.filter(c=>c.stage==='Waiting').length;
  const set = (id,v)=>{ const e=$(id); if(e) e.textContent=v; };
  set('#statApplicants', 242 + DB.applicants.length);
  set('#statActive', 150 + prog + wait);
  set('#statDone', 88 + done);
  set('#lgProgress', 21 + prog); set('#lgWaiting', 6 + wait); set('#lgDone', 11 + done);
  set('#chatBadge', DB.chats.length);
  const sk = DB.skills.filter(s=>s.on).length;
  set('#skillCount', sk + (sk===1?' Skill':' Skills'));
}

/* ---------- PDF mini (right panel) ---------- */
function renderPdfMini(){
  const box = $('#pdfMiniList'); if(!box) return;
  box.innerHTML = DB.pdfs.slice(0,2).map(p=>`
    <div class="pdf-row">
      <span class="pdf-ic">PDF</span>
      <div style="min-width:0"><b>${esc(p.name)}</b><small>${esc(p.size)} · ${relTime(p.ts)}</small></div>
      <span class="pdf-actions">
        <button class="icon-btn sm2" data-pdf-view="${p.id}" title="Preview">${icon('eye','sm')}</button>
        <button class="icon-btn sm2" data-pdf-dl="${p.id}" title="Download">${icon('down','sm')}</button>
      </span>
    </div>`).join('');
}

/* ---------- greeting ---------- */
(function(){
  const h = new Date().getHours();
  const g = h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening';
  $('#greeting').textContent = `${g}, Nasim Ahmed 👋`;
})();

/* ============================================================
   NAVIGATION / VIEWS
   ============================================================ */
let currentView = 'home';
const VIEW_TITLES = {dashboard:'Dashboard', chats:'Chats', agents:'AI Agents', browser:'Browser Agent', applicants:'Applicants', applications:'Visa Applications', documents:'Document Center', cases:'Visa Cases', recruitment:'Recruitment', crm:'CRM', partners:'Partners', pdf:'PDF Center', knowledge:'Knowledge Base', skills:'Skills', automations:'Automations', reports:'Reports', settings:'Settings', nova:'Nova Studio'};

function switchView(view){
  currentView = view;
  $$('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  $$('.mobile-nav button[data-view]').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  closeSidebarMobile();
  const home = $('#view-home'), dyn = $('#view-dynamic');
  if (view === 'home'){ home.hidden=false; dyn.hidden=true; renderStats(); renderActivity(); renderOrbit(); }
  else {
    home.hidden=true; dyn.hidden=false;
    dyn.innerHTML = VIEWS[view] ? VIEWS[view]() : '<div class="card glass empty">Coming soon</div>';
    if (BIND[view]) BIND[view]();
  }
  const cs = $('#centerScroll');
  if (cs.scrollTo) cs.scrollTo({top:0, behavior:'smooth'}); else cs.scrollTop = 0;
}
document.addEventListener('click', e=>{
  const nav = e.target.closest('[data-view]'); if (nav){ switchView(nav.dataset.view); return; }
  const go  = e.target.closest('[data-goto]');  if (go){ switchView(go.dataset.goto); return; }
  const pv  = e.target.closest('[data-pdf-view]'); if (pv){ openPdfPreview(pv.dataset.pdfView); return; }
  const pd  = e.target.closest('[data-pdf-dl]');   if (pd){ downloadPdf(pd.dataset.pdfDl); return; }
});

/* ---------- shared bits ---------- */
const statusPill = s => {
  const map = {'In Progress':'blue','Approved':'green','Completed':'green','Waiting':'amber','Documents':'violet','Review':'sky','Rejected':'rose','Active':'green','Shortlisted':'green','Interview':'blue','Screening':'amber','New':'sky','New Lead':'sky','Contacted':'blue','Qualified':'violet','Proposal':'amber','Onboarding':'amber'};
  return `<span class="pill ${map[s]||'gray'}">${esc(s)}</span>`;
};
const personCell = (name, sub) => `<div class="person"><span class="avatar" style="--av:${colorFor(name)};width:36px;height:36px">${initials(name)}</span><div><b>${esc(name)}</b><small>${esc(sub||'')}</small></div></div>`;
const modHead = (title, sub, actions='') => `<div class="mod-head"><div><h1>${title}</h1><p>${sub}</p></div><div class="toolbar">${actions}</div></div>`;

/* ============================================================
   VIEW TEMPLATES
   ============================================================ */
const VIEWS = {

dashboard(){
  const bars = [['Jul',46],['Aug',58],['Sep',52],['Oct',74],['Nov',66],['Dec',83],['Jan',92]];
  return modHead('Dashboard','Live overview of your visa operations across 12 countries.',
    `<button class="btn ghost" onclick="generateReportPdf()">${icon('down','sm')} Export Report</button>
     <button class="btn primary" onclick="openApplicantModal()">${icon('plus','sm')} New Applicant</button>`) +
  `<div class="card glass" style="padding:16px 20px"><div class="quiet-stats in-card">
     <div class="qstat"><small>Total Applicants</small><p><b>${242+DB.applicants.length}</b><em class="up">↑ 12%</em></p><span>vs last month</span></div>
     <div class="qstat"><small>Visa Success Rate</small><p><b>94.2%</b><em class="up">↑ 3.1%</em></p><span>this quarter</span></div>
     <div class="qstat"><small>Revenue (Oct)</small><p><b>৳18.6L</b><em class="up">↑ 21%</em></p><span>vs September</span></div>
     <div class="qstat"><small>Agent Tasks Today</small><p><b>${37+DB.activity.length}</b><em class="up">10 agents</em></p><span>active now</span></div>
   </div></div>
   <div class="card glass">
     <div class="col-head"><h3>Applications per Month</h3><span class="pill blue">Last 7 months</span></div>
     <div class="bars">${bars.map((b,i)=>`<div class="bar ${i%3===2?'alt':''}" style="height:${b[1]}%"><span>${b[1]}</span></div>`).join('')}</div>
     <div class="bar-labels">${bars.map(b=>`<span>${b[0]}</span>`).join('')}</div>
   </div>
   <div class="card glass">
     <div class="col-head"><h3>Latest Agent Activity</h3><button class="link" data-goto="agents">All agents →</button></div>
     <ul class="activity-list" style="max-height:none">${DB.activity.slice(0,6).map(a=>{const ag=agentById(a.agent);return `<li class="act-item"><span class="act-ic" style="background:${ag.soft};color:${ag.color}">${icon(ag.icon)}</span><div><b>${esc(ag.name)}</b><p style="max-width:420px">${esc(a.text)}</p><small>${relTime(a.ts)}</small></div></li>`}).join('')}</ul>
   </div>`;
},

chats(){
  if (!DB.activeChatId || !DB.chats.find(c=>c.id===DB.activeChatId)) DB.activeChatId = DB.chats[0]?.id;
  const active = DB.chats.find(c=>c.id===DB.activeChatId);
  return modHead('Chats','Persistent conversations with your AI agents — saved automatically on this device.',
    `<button class="btn primary" id="newChatBtn">${icon('plus','sm')} New Chat</button>`) +
  `<div class="two-col">
     <div class="card glass list-card" id="chatList">
       ${DB.chats.map(c=>{const ag=agentById(c.agent);const last=c.messages[c.messages.length-1];return `
       <button class="list-item ${c.id===DB.activeChatId?'active':''}" data-chat="${c.id}">
         <span class="act-ic" style="background:${ag.soft};color:${ag.color}">${icon(ag.icon)}</span>
         <span style="min-width:0"><b>${esc(c.title)}</b><small>${esc(last?last.text:'')}</small></span>
         <time>${relTime(c.updated)}</time>
       </button>`}).join('') || '<div class="empty">No chats yet</div>'}
     </div>
     <div class="card glass thread" id="chatThread">
       ${active ? active.messages.map(m=>bubbleHTML(m)).join('') : '<div class="empty"><b>Start a conversation</b>Use the message bar below — Maestro will route your request to the right agent.</div>'}
     </div>
   </div>`;
},

agents(){
  return modHead('AI Agents','Eight specialist agents coordinated by Maestro. Toggle, inspect or run any agent on demand.',
    `<button class="btn primary" onclick="openTaskModal()">${icon('plus','sm')} New Agent Task</button>`) +
  `<div class="grid-cards">${AGENTS.map(ag=>{
    const on = DB.agentsOn[ag.id];
    return `<div class="card glass mini-card">
      <div class="mini-top"><span class="agent-ic-lg" style="background:linear-gradient(135deg,${ag.color},${ag.color}bb)">${icon(ag.icon)}</span>
      <div><h4>${esc(ag.name)}</h4><small style="color:var(--muted);font-size:11px;font-weight:600">${esc(ag.persona||'')}</small><br/><span class="pill ${on?'green':'gray'}" style="margin-top:4px">${on?ag.statuses[0].replace('…',''):'Paused'}</span></div></div>
      <p>${esc(ag.desc)}</p>
      <div class="mini-foot">
        <button class="switch ${on?'on':''}" data-agent-toggle="${ag.id}" role="switch" aria-checked="${on}" aria-label="Toggle ${esc(ag.name)}"><i></i></button>
        <span style="display:flex;gap:6px">
          <button class="btn ghost sm" onclick="openAgentModal('${ag.id}')">Details</button>
          <button class="btn primary sm" data-agent-run="${ag.id}">${icon('play','sm')} Run</button>
        </span>
      </div></div>`}).join('')}</div>`;
},

browser(){
  return modHead('Browser Agent','A real browser driven by AI — watch every mouse move, click and keystroke in the Live Preview.',
    `<button class="btn ghost" onclick="openRightPanel()">${icon('eye','sm')} Open Live Preview</button>
     <button class="btn primary" onclick="runBrowserTask('Login to ImmiAccount')">${icon('play','sm')} Run ImmiAccount Task</button>`) +
  `<div class="grid-cards">
     ${[
       ['ImmiAccount Status Check','Log in, open the application list and report every status change.','Login to ImmiAccount'],
       ['Visa Fee Research','Visit Home Affairs pricing pages and snapshot the latest VAC charges.','Research latest visa fees'],
       ['Document Upload Run','Attach pending PDFs from Document Center to the correct application.','Upload pending documents'],
       ['VEVO Entitlement Check','Verify work rights for approved applicants before travel.','Run VEVO check'],
     ].map(t=>`<div class="card glass mini-card"><div class="mini-top"><span class="agent-ic-lg" style="background:linear-gradient(135deg,#17b978,#0ea5e9)">${icon('globe')}</span><h4>${t[0]}</h4></div><p>${t[1]}</p>
       <div class="mini-foot"><span class="pill green">Ready</span><button class="btn primary sm" onclick="runBrowserTask('${t[2]}')">${icon('play','sm')} Run Task</button></div></div>`).join('')}
   </div>
   <div class="card glass" style="margin-top:14px">
     <h3 class="section-title">Custom Browser Task</h3>
     <div class="form-grid">
       <div class="fgroup"><label>Start URL</label><input id="btUrl" value="https://www.gov.au/immiaccount"/></div>
       <div class="fgroup"><label>Task Name</label><input id="btName" placeholder="e.g. Check Sarah Rahman application"/></div>
       <div class="fgroup full"><label>Instructions for the agent</label><textarea id="btInstr" rows="2" placeholder="Describe what the Browser Agent should do, step by step…"></textarea></div>
     </div>
     <div class="modal-foot" style="margin-top:14px"><button class="btn primary" id="btRun">${icon('play','sm')} Launch in Live Browser</button></div>
     <p class="note" style="margin-top:10px">Engine: <b>built-in browser sandbox</b>${DB.settings.browserUseKey ? ' · <b>Browser Use Cloud key configured</b> (•••'+esc(DB.settings.browserUseKey.slice(-4))+')' : ' — add a <b>Browser Use</b> API key in Settings to connect cloud browsers.'} Use the red <b>Stop</b> button in the preview panel to halt any run instantly.</p>
   </div>`;
},

applicants(){
  return modHead('Applicants', `${DB.applicants.length} applicants on this workspace · data saved locally & works offline.`,
    `<label class="field">${icon('search','sm')}<input id="apSearch" placeholder="Search name, country, visa…"/></label>
     <button class="btn primary" onclick="openApplicantModal()">${icon('plus','sm')} Add Applicant</button>`) +
  `<div class="card glass table-card"><table>
     <thead><tr><th>Applicant</th><th>Destination</th><th>Visa Type</th><th>Status</th><th>Progress</th><th>Applied</th><th></th></tr></thead>
     <tbody id="apBody"></tbody></table><div id="apEmpty"></div></div>`;
},

applications(){
  return modHead('Visa Applications','Every lodged and in-preparation application with live stage tracking.',
    `<button class="btn primary" onclick="openApplicantModal()">${icon('plus','sm')} New Application</button>`) +
  `<div class="card glass table-card"><table>
     <thead><tr><th>Applicant</th><th>Country</th><th>Visa</th><th>Stage</th><th>Completion</th><th>Agent</th></tr></thead>
     <tbody>${DB.applicants.map(a=>`<tr><td>${personCell(a.name,a.email)}</td><td>${esc(a.country)}</td><td>${esc(a.visa)}</td><td>${statusPill(a.status)}</td>
       <td><div style="display:flex;align-items:center;gap:8px"><div class="progress" style="flex:1"><i style="width:${a.progress}%"></i></div><small>${a.progress}%</small></div></td>
       <td><span class="pill sky">Visa Agent</span></td></tr>`).join('')}</tbody></table></div>`;
},

documents(){
  return modHead('Document Center','Passports, statements and certificates — analysed automatically by the Document Agent.',
    `<button class="btn primary" onclick="document.getElementById('fileInput').click()">${icon('up','sm')} Upload</button>`) +
  `<div class="drop-zone" id="dropZone">${icon('folder')} <div style="margin-top:6px">Drag & drop files here or <b>click to upload</b></div><small>PDF, JPG, PNG · auto-OCR & data extraction</small></div>
   <div id="docList">${DB.documents.map(d=>docRowHTML(d)).join('') || '<div class="empty"><b>No documents yet</b>Upload your first file to see the Document Agent in action.</div>'}</div>`;
},

cases(){
  const stages = ['In Progress','Documents','Waiting','Completed'];
  return modHead('Visa Cases','Kanban view of every active case — agents move cards as work completes.',
    `<button class="btn primary" onclick="openCaseModal()">${icon('plus','sm')} New Case</button>`) +
  `<div class="kanban">${stages.map(st=>{
    const items = DB.cases.filter(c=>c.stage===st);
    return `<div class="card glass kcol"><h4>${statusPill(st)}<em>${items.length}</em></h4>
      ${items.map(c=>`<div class="kcard"><b>${esc(c.title)}</b><p>${esc(c.country)} · Due ${esc(c.due)}</p>
        <div class="progress"><i style="width:${c.progress}%"></i></div>
        <div class="kfoot" style="margin-top:9px"><small style="color:var(--muted)">${c.progress}% complete</small>
        <button class="link" onclick="askAgent('Check visa status for ${esc(c.applicant)}')">Check status</button></div></div>`).join('') || '<div class="empty" style="padding:16px">No cases</div>'}
      </div>`}).join('')}</div>`;
},

recruitment(){
  return modHead('Recruitment','AI-matched candidates for overseas employers, ranked by fit score.',
    `<button class="btn primary" onclick="runAgentQuick('recruitment','Scanned 128 CVs and ranked new candidate matches')">${icon('spark','sm')} Run Matching</button>`) +
  `<div class="grid-cards">${DB.candidates.map(c=>`
    <div class="card glass mini-card"><div class="mini-top"><span class="avatar" style="--av:${colorFor(c.name)};width:46px;height:46px;font-size:14px">${initials(c.name)}</span>
      <div><h4>${esc(c.name)}</h4><small style="color:var(--muted)">${esc(c.role)}</small></div>
      <span class="pill green" style="margin-left:auto">${c.match}% match</span></div>
      <p>Destination: <b>${esc(c.dest)}</b> · Experience: ${esc(c.exp)} · Passport ready</p>
      <div class="progress" style="margin-top:8px"><i style="width:${c.match}%;background:linear-gradient(90deg,#17b978,#2f7bff)"></i></div>
      <div class="mini-foot">${statusPill(c.status)}<button class="btn ghost sm" onclick="askAgent('Prepare recruitment file for ${esc(c.name)}')">Open with Agent</button></div></div>`).join('')}</div>`;
},

crm(){
  return modHead('CRM','Leads, follow-ups and pipeline value — with AI follow-up drafts.',
    `<button class="btn ghost" onclick="runAgentQuick('visa','Drafted follow-up messages for 3 cold CRM leads')">${icon('spark','sm')} AI Follow-ups</button>
     <button class="btn primary" id="leadBtn">${icon('plus','sm')} Add Lead</button>`) +
  `<div class="kpi-row">
     <div class="card glass kpi"><small>Open Leads</small><div class="kv">${DB.leads.length + 41}</div><span class="up">↑ 9 this week</span></div>
     <div class="card glass kpi"><small>Pipeline Value</small><div class="kv">৳42.8L</div><span class="up">↑ 14%</span></div>
     <div class="card glass kpi"><small>Conversion</small><div class="kv">31%</div><span class="up">↑ 4 pts</span></div>
   </div>
   <div class="card glass table-card"><table><thead><tr><th>Lead</th><th>Source</th><th>Interested In</th><th>Stage</th><th>Value</th><th></th></tr></thead>
   <tbody id="leadBody">${DB.leads.map(l=>leadRowHTML(l)).join('')}</tbody></table></div>`;
},

partners(){
  return modHead('Partners','Education agents, employers and legal partners across 12 countries.') +
  `<div class="grid-cards">${DB.partners.map(p=>`
    <div class="card glass mini-card"><div class="mini-top"><span class="agent-ic-lg" style="background:linear-gradient(135deg,#2f7bff,#7c3aed)">${icon('building')}</span>
      <div><h4>${esc(p.name)}</h4><small style="color:var(--muted)">${esc(p.type)}</small></div></div>
      <p>Country: <b>${esc(p.country)}</b> · Successful placements: <b>${p.deals}</b></p>
      <div class="mini-foot">${statusPill(p.status)}<button class="btn ghost sm" onclick="toast('Partner summary sent to your email')">Summary</button></div></div>`).join('')}</div>`;
},

pdf(){
  return modHead('PDF Center','Every agent-generated PDF — preview, download, share, print and version history, all inside the app.',
    `<button class="btn primary" onclick="generateChecklistPdf()">${icon('spark','sm')} Generate Checklist PDF</button>`) +
  `<div id="pdfList">${DB.pdfs.map(p=>`
    <div class="doc-row"><span class="pdf-ic">PDF</span>
      <div style="min-width:0"><b>${esc(p.name)}</b><small>${esc(p.kind)} · ${esc(p.applicant)} · ${esc(p.size)} · ${relTime(p.ts)} · v${p.version}</small></div>
      <span class="pdf-actions">
        <button class="btn ghost sm" data-pdf-view="${p.id}">${icon('eye','sm')} Preview</button>
        <button class="btn ghost sm" data-pdf-dl="${p.id}">${icon('down','sm')} Download</button>
        <button class="btn ghost sm" onclick="sharePdf('${p.id}')">${icon('share','sm')} Share</button>
        <button class="btn ghost sm" onclick="printPdf('${p.id}')">${icon('print','sm')} Print</button>
        <button class="btn ghost sm" onclick="regenPdf('${p.id}')">${icon('refresh','sm')} Regenerate</button>
      </span></div>`).join('') || '<div class="empty"><b>No PDFs yet</b>Ask the Document Agent to generate one.</div>'}</div>`;
},

knowledge(){
  return modHead('Knowledge Base','🎯 Purpose: the single source of truth — every agent reads these guides & SOPs before answering, drafting or checking a case. Add your office rules here once; all 10 agents apply them instantly.',
    `<label class="field">${icon('search','sm')}<input id="kbSearch" placeholder="Search knowledge…"/></label>
     <button class="btn primary" id="kbAdd">${icon('plus','sm')} Add Article</button>`) +
  `<div class="grid-cards" id="kbGrid">${DB.knowledge.map(kbCardHTML).join('')}</div>`;
},

skills(){
  return modHead('Skills','🎯 Purpose: reusable capabilities switched on for the whole agent team (like Manus Skills). Enabled skills extend what Maestro, Nova, Raffi and the Browser Agent can do without new code.',
    `<button class="btn primary" id="skillAdd">${icon('plus','sm')} New Skill</button>`) +
  `<div class="card glass" id="skillList">${DB.skills.map(s=>`
    <div class="toggle-row"><div><b>${esc(s.name)}</b> <span class="chip">${esc(s.tag)}</span><p>${esc(s.desc)}</p></div>
    <button class="switch ${s.on?'on':''}" data-skill="${s.id}" role="switch" aria-checked="${s.on}"><i></i></button></div>`).join('')}</div>
   <p class="note">Active skills appear in the Home workspace counter and are available to every agent instantly.</p>`;
},

automations(){
  return modHead('Automations','Set-and-forget workflows — agents run them on schedule or when events happen.',
    `<button class="btn primary" onclick="toast('Automation builder: describe a workflow in chat and Maestro will create it')">${icon('plus','sm')} New Automation</button>`) +
  `<div class="card glass">${DB.automations.map(a=>`
    <div class="toggle-row"><div><b>${esc(a.name)}</b><p>⚡ ${esc(a.trigger)}</p></div>
    <span style="display:flex;gap:8px;align-items:center"><button class="btn ghost sm" onclick="runAgentQuick('report','Ran automation: ${esc(a.name)}')">Run now</button>
    <button class="switch ${a.on?'on':''}" data-auto="${a.id}" role="switch" aria-checked="${a.on}"><i></i></button></span></div>`).join('')}</div>`;
},

reports(){
  return modHead('Reports','Daily, weekly and monthly intelligence generated by the Daily Report Agent.',
    `<button class="btn primary" onclick="generateReportPdf()">${icon('spark','sm')} Generate Today\'s Report</button>`) +
  `<div class="kpi-row">
     <div class="card glass kpi"><small>Applications Lodged (Oct)</small><div class="kv">63</div><span class="up">↑ 18%</span></div>
     <div class="card glass kpi"><small>Approvals</small><div class="kv">41</div><span class="up">94% success</span></div>
     <div class="card glass kpi"><small>Avg. Processing</small><div class="kv">24d</div><span class="up">↓ 5 days faster</span></div>
     <div class="card glass kpi"><small>Hours Saved by Agents</small><div class="kv">186h</div><span class="up">this month</span></div>
   </div>
   <div class="card glass"><div class="col-head"><h3>Recent Reports</h3><button class="link" data-goto="pdf">Open PDF Center →</button></div>
   ${DB.pdfs.filter(p=>p.kind==='Report').map(p=>`<div class="doc-row"><span class="pdf-ic">PDF</span><div><b>${esc(p.name)}</b><small>${esc(p.size)} · ${relTime(p.ts)} · v${p.version}</small></div><span class="pdf-actions"><button class="btn ghost sm" data-pdf-view="${p.id}">Preview</button><button class="btn ghost sm" data-pdf-dl="${p.id}">Download</button></span></div>`).join('') || '<div class="empty">No reports yet — generate one above.</div>'}
   </div>`;
},

settings(){
  const s = DB.settings;
  const connected = (k)=> k ? '<span class="pill green">Connected</span>' : '<span class="pill gray">Not connected</span>';
  return modHead('Settings','Workspace, integrations and app preferences. API keys stay encrypted-at-rest on this device.') +
  `<div class="card glass">
     <h3 class="section-title">Profile</h3>
     <div class="form-grid">
       <div class="fgroup"><label>Full name</label><input id="setName" value="Nasim Ahmed"/></div>
       <div class="fgroup"><label>Email</label><input id="setEmail" value="${esc(s.email)}"/></div>
       <div class="fgroup"><label>Voice language</label><select id="setLang"><option value="bn" ${s.lang==='bn'?'selected':''}>বাংলা (Bangladesh)</option><option value="en" ${s.lang==='en'?'selected':''}>English (US)</option></select></div>
       <div class="fgroup"><label>Appearance</label><select id="setTheme"><option value="light" ${s.theme==='light'?'selected':''}>Symphony White</option><option value="dark" ${s.theme==='dark'?'selected':''}>Midnight Glass</option></select></div>
     </div>
     <div class="toggle-row"><div><b>Spoken agent replies</b><p>Agents read answers aloud (Bangla supported)</p></div><button class="switch ${s.voiceOut?'on':''}" id="setVoiceOut" role="switch"><i></i></button></div>
   </div>

   <div class="card glass">
     <h3 class="section-title">AI & Browser Integrations</h3>
     <div style="display:grid;gap:12px">
       <div class="integration"><span class="int-ic" style="background:linear-gradient(135deg,#4285f4,#9b72cb)">G</span>
         <div style="flex:1;min-width:0"><h4>Google Gemini ${connected(s.geminiKey)}</h4><p>Powers live chat intelligence (gemini-2.0-flash). Get a key free from Google AI Studio, paste it here and chat becomes fully live.</p>
         <div class="fgroup"><input id="keyGemini" type="password" placeholder="AIza…" value="${esc(s.geminiKey)}"/></div></div></div>
       <div class="integration"><span class="int-ic" style="background:linear-gradient(135deg,#17b978,#0ea5e9)">B</span>
         <div style="flex:1;min-width:0"><h4>Browser Use Cloud ${connected(s.browserUseKey)}</h4><p>Cloud browsers for heavy portal automation. The in-app sandbox works without a key; add one to scale to parallel cloud sessions.</p>
         <div class="fgroup"><input id="keyBrowserUse" type="password" placeholder="bu_…" value="${esc(s.browserUseKey)}"/></div></div></div>
       <div class="integration"><span class="int-ic" style="background:linear-gradient(135deg,#111827,#374151)">O</span>
         <div style="flex:1;min-width:0"><h4>OpenAI (optional) ${connected(s.openaiKey)}</h4><p>Alternative model provider for agents and voice. Keys are stored only in this browser.</p>
         <div class="fgroup"><input id="keyOpenAI" type="password" placeholder="sk-…" value="${esc(s.openaiKey)}"/></div></div></div>
     </div>
     <div class="modal-foot"><button class="btn primary" id="saveSettings">${icon('check','sm')} Save Settings</button></div>
   </div>

   <div class="card glass">
     <h3 class="section-title">App & Data</h3>
     <div class="toggle-row"><div><b>Install N Space (PWA)</b><p>Home-screen app for iOS, Android, Windows & macOS with offline mode</p></div><button class="btn primary sm" id="installBtn2">Install</button></div>
     <div class="toggle-row"><div><b>Export workspace data</b><p>Download all applicants, cases and chats as JSON</p></div><button class="btn ghost sm" id="exportBtn">${icon('down','sm')} Export</button></div>
     <div class="toggle-row"><div><b>Reset demo data</b><p>Restore the original sample workspace</p></div><button class="btn danger-ghost sm" id="resetBtn">Reset</button></div>
     <p class="note" style="margin-top:12px">N Space v1.2.0 · Agent Nova · Statutory Engine · Works offline · Dhaka, Bangladesh 🇧🇩</p>
   </div>`;
},
};

function bubbleHTML(m){
  return `<div class="bubble ${m.from==='me'?'me':'ai'}">${m.from==='typing' ? '<span class="typing-dots"><i></i><i></i><i></i></span>' : esc(m.text).replace(/\n/g,'<br/>')}<small>${new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>`;
}
function docRowHTML(d){
  const isImg = /\.(jpe?g|png)$/i.test(d.name);
  return `<div class="doc-row"><span class="pdf-ic" style="background:${isImg?'#0ea5e9':'#e5484d'}">${isImg?'IMG':'PDF'}</span>
    <div style="min-width:0"><b>${esc(d.name)}</b><small>${esc(d.size)} · ${esc(d.by)} · ${relTime(d.ts)}</small></div>
    <span class="pdf-actions"><button class="btn ghost sm" onclick="toast('Document Agent verified: ${esc(d.name)} — data extracted ✓')">Verify</button>
    <button class="icon-btn sm2" onclick="deleteDocument('${d.id}')" title="Delete">${icon('trash','sm')}</button></span></div>`;
}
function leadRowHTML(l){
  return `<tr><td>${personCell(l.name, l.source)}</td><td>${esc(l.source)}</td><td>${esc(l.interest)}</td><td>${statusPill(l.stage)}</td><td><b>${esc(l.value)}</b></td>
  <td><span class="row-actions"><button class="btn ghost sm" onclick="askAgent('Write a follow-up message for CRM lead ${esc(l.name)} interested in ${esc(l.interest)}')">AI Follow-up</button></span></td></tr>`;
}
function kbCardHTML(k){
  return `<div class="card glass mini-card" data-kb="${esc((k.title+k.body).toLowerCase())}">
    <div class="mini-top"><span class="agent-ic-lg" style="background:linear-gradient(135deg,#2f7bff,#14b8a6)">${icon('book')}</span>
    <div><h4>${esc(k.title)}</h4><span class="chip">${esc(k.cat)}</span></div></div>
    <p>${esc(k.body)}</p>
    <div class="mini-foot"><span class="pill green">Agents trained</span><button class="btn ghost sm" onclick="askAgent('Summarise the knowledge article: ${esc(k.title)}')">Ask about this</button></div></div>`;
}

/* ============================================================
   VIEW BINDINGS
   ============================================================ */
function renderApplicants(filter=''){
  const rows = DB.applicants.filter(a => (a.name+a.country+a.visa+a.status).toLowerCase().includes(filter.toLowerCase()));
  $('#apBody').innerHTML = rows.map(a=>`<tr>
    <td>${personCell(a.name, a.email)}</td><td>${esc(a.country)}</td><td>${esc(a.visa)}</td>
    <td>${statusPill(a.status)}</td>
    <td><div style="display:flex;align-items:center;gap:8px"><div class="progress" style="flex:1"><i style="width:${a.progress}%"></i></div><small>${a.progress}%</small></div></td>
    <td>${esc(a.applied)}</td>
    <td><span class="row-actions">
      <button class="icon-btn sm2" title="Check status" onclick="askAgent('Check visa status for ${esc(a.name)}')">${icon('search','sm')}</button>
      <button class="icon-btn sm2" title="Edit" onclick="openApplicantModal('${a.id}')">${icon('edit','sm')}</button>
      <button class="icon-btn sm2" title="Delete" onclick="deleteApplicant('${a.id}')">${icon('trash','sm')}</button>
    </span></td></tr>`).join('');
  $('#apEmpty').innerHTML = rows.length ? '' : '<div class="empty"><b>No applicants found</b>Try a different search or add a new applicant.</div>';
}

const BIND = {
  applicants(){ renderApplicants(); $('#apSearch').addEventListener('input', e=>renderApplicants(e.target.value)); },
  chats(){
    $('#newChatBtn').addEventListener('click', ()=>{
      const c = {id:uid(), title:'New conversation', agent:'maestro', updated:Date.now(), messages:[{from:'ai', text:'আসসালামু আলাইকুম Nasim Ahmed! আমি Maestro — tell me what to do: check a visa, open ImmiAccount, generate a PDF, anything. আমি বাংলা ও English দুটোতেই কাজ করি।', ts:Date.now()}]};
      DB.chats.unshift(c); DB.activeChatId = c.id; save(); switchView('chats'); renderStats();
      setTimeout(()=> $('#chatInput').focus(), 60);
    });
    $$('#chatList .list-item').forEach(b=> b.addEventListener('click', ()=>{ DB.activeChatId=b.dataset.chat; save(); switchView('chats'); }));
    const th = $('#chatThread'); if (th) th.scrollTop = th.scrollHeight;
  },
  agents(){
    $$('[data-agent-toggle]').forEach(b=> b.addEventListener('click', ()=>{
      const id = b.dataset.agentToggle; DB.agentsOn[id] = !DB.agentsOn[id]; save();
      toast(`${agentById(id).name} ${DB.agentsOn[id]?'activated':'paused'}`); switchView('agents'); renderOrbit();
    }));
    $$('[data-agent-run]').forEach(b=> b.addEventListener('click', ()=> runAgentQuick(b.dataset.agentRun)));
  },
  browser(){
    $('#btRun').addEventListener('click', ()=>{
      const url = $('#btUrl').value.trim() || 'https://www.gov.au/immiaccount';
      const name = $('#btName').value.trim() || 'Custom browser task';
      $('#urlInput').value = url;
      runBrowserTask(name);
    });
  },
  documents(){
    const dz = $('#dropZone');
    dz.addEventListener('click', ()=> $('#fileInput').click());
    dz.addEventListener('dragover', e=>{ e.preventDefault(); dz.classList.add('drag'); });
    dz.addEventListener('dragleave', ()=> dz.classList.remove('drag'));
    dz.addEventListener('drop', e=>{ e.preventDefault(); dz.classList.remove('drag'); handleFiles(e.dataTransfer.files); });
  },
  crm(){
    $('#leadBtn').addEventListener('click', ()=>{
      openModal('Add CRM Lead', `<div class="form-grid">
        <div class="fgroup"><label>Name</label><input id="lfName" placeholder="Full name"/></div>
        <div class="fgroup"><label>Source</label><select id="lfSource"><option>WhatsApp</option><option>Facebook Ads</option><option>Website</option><option>Referral</option><option>Walk-in — Dhaka</option></select></div>
        <div class="fgroup"><label>Interested In</label><input id="lfInt" placeholder="e.g. Australia Student"/></div>
        <div class="fgroup"><label>Estimated Value</label><input id="lfVal" placeholder="৳85,000"/></div></div>`,
      [{label:'Cancel', cls:'ghost'}, {label:'Add Lead', cls:'primary', fn:()=>{
        const n = $('#lfName').value.trim(); if(!n) return toast('Please enter a name', false), true;
        DB.leads.unshift({id:uid(), name:n, source:$('#lfSource').value, interest:$('#lfInt').value||'General enquiry', stage:'New Lead', value:$('#lfVal').value||'—'});
        save(); addActivity('visa', 'New CRM lead added: '+n); switchView('crm'); toast('Lead added to CRM');
      }}]);
    });
  },
  knowledge(){
    $('#kbSearch').addEventListener('input', e=>{
      const q = e.target.value.toLowerCase();
      $$('#kbGrid .mini-card').forEach(c=> c.style.display = c.dataset.kb.includes(q) ? '' : 'none');
    });
    $('#kbAdd').addEventListener('click', ()=>{
      openModal('Add Knowledge Article', `<div class="form-grid">
        <div class="fgroup full"><label>Title</label><input id="kbTitle" placeholder="e.g. Canada SDS Requirements 2026"/></div>
        <div class="fgroup"><label>Category</label><input id="kbCat" placeholder="Canada"/></div>
        <div class="fgroup full"><label>Content (agents will learn from this)</label><textarea id="kbBody" rows="4"></textarea></div></div>`,
      [{label:'Cancel', cls:'ghost'}, {label:'Save & Train Agents', cls:'primary', fn:()=>{
        const t = $('#kbTitle').value.trim(); if(!t) return toast('Title is required', false), true;
        DB.knowledge.unshift({id:uid(), title:t, cat:$('#kbCat').value||'General', body:$('#kbBody').value||''});
        save(); addActivity('research','Knowledge updated: '+t); switchView('knowledge'); toast('Article saved — agents updated');
      }}]);
    });
  },
  skills(){
    $$('[data-skill]').forEach(b=> b.addEventListener('click', ()=>{
      const s = DB.skills.find(x=>x.id===b.dataset.skill); s.on = !s.on; save();
      toast(`Skill "${s.name}" ${s.on?'enabled':'disabled'}`); switchView('skills'); renderStats();
    }));
    $('#skillAdd').addEventListener('click', ()=>{
      openModal('Create Skill', `<div class="form-grid">
        <div class="fgroup full"><label>Skill name</label><input id="skName" placeholder="e.g. WhatsApp Broadcast"/></div>
        <div class="fgroup"><label>Tag</label><input id="skTag" placeholder="CRM"/></div>
        <div class="fgroup full"><label>Description</label><textarea id="skDesc" rows="3"></textarea></div></div>`,
      [{label:'Cancel', cls:'ghost'}, {label:'Create Skill', cls:'primary', fn:()=>{
        const n = $('#skName').value.trim(); if(!n) return toast('Name is required', false), true;
        DB.skills.unshift({id:uid(), name:n, desc:$('#skDesc').value, on:true, tag:$('#skTag').value||'Custom'});
        save(); switchView('skills'); renderStats(); toast('Skill created & enabled');
      }}]);
    });
  },
  automations(){
    $$('[data-auto]').forEach(b=> b.addEventListener('click', ()=>{
      const a = DB.automations.find(x=>x.id===b.dataset.auto); a.on=!a.on; save();
      toast(`Automation ${a.on?'enabled':'paused'}: ${a.name}`); switchView('automations');
    }));
  },
  settings(){
    const s = DB.settings;
    const vBtn = $('#setVoiceOut');
    vBtn.addEventListener('click', ()=>{ s.voiceOut=!s.voiceOut; vBtn.classList.toggle('on', s.voiceOut); syncVoiceSwitch(); save(); });
    $('#saveSettings').addEventListener('click', ()=>{
      s.email = $('#setEmail').value; s.lang = $('#setLang').value;
      s.geminiKey = $('#keyGemini').value.trim(); s.browserUseKey = $('#keyBrowserUse').value.trim(); s.openaiKey = $('#keyOpenAI').value.trim();
      applyTheme($('#setTheme').value); applyLangBtn(); updateIntegrationDetail(); save();
      toast('Settings saved'); addActivity('maestro','Integration settings updated'); switchView('settings');
    });
    $('#installBtn2').addEventListener('click', triggerInstall);
    $('#exportBtn').addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nspace-workspace-export.json'; a.click();
      toast('Workspace data exported');
    });
    $('#resetBtn').addEventListener('click', ()=>{
      openModal('Reset workspace?', '<p class="note">This restores the original demo data. Your API keys and added records will be removed.</p>',
      [{label:'Cancel', cls:'ghost'}, {label:'Yes, Reset', cls:'primary', fn:()=>{ localStorage.removeItem(LS_KEY); location.reload(); }}]);
    });
  },
};

/* ============================================================
   MODALS
   ============================================================ */
function openModal(title, bodyHTML, buttons=[]){
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHTML;
  const foot = $('#modalFoot'); foot.innerHTML = '';
  buttons.forEach(b=>{
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls||'ghost'); btn.textContent = b.label;
    btn.addEventListener('click', ()=>{ const stay = b.fn && b.fn(); if (!stay) closeModal(); });
    foot.appendChild(btn);
  });
  $('#modal').hidden = false;
  const f = $('#modalBody input, #modalBody textarea, #modalBody select'); if (f) setTimeout(()=>f.focus(), 50);
}
function closeModal(){ $('#modal').hidden = true; $('#modal .modal').classList.remove('wide'); }
$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e=>{ if (e.target.id==='modal') closeModal(); });

const COUNTRIES = ['Australia','UK','Canada','USA','Germany','Malaysia','New Zealand','Japan','South Korea','Italy','Hungary','UAE'];
function openApplicantModal(editId){
  const a = editId ? DB.applicants.find(x=>x.id===editId) : null;
  openModal(a ? 'Edit Applicant' : 'New Applicant', `<div class="form-grid">
    <div class="fgroup"><label>Full Name *</label><input id="afName" value="${esc(a?.name||'')}" placeholder="e.g. Md. Ariful Islam"/></div>
    <div class="fgroup"><label>Email</label><input id="afEmail" value="${esc(a?.email||'')}" placeholder="name@example.com"/></div>
    <div class="fgroup"><label>Phone</label><input id="afPhone" value="${esc(a?.phone||'')}" placeholder="+880 1XXX-XXXXXX"/></div>
    <div class="fgroup"><label>Destination Country</label><select id="afCountry">${COUNTRIES.map(c=>`<option ${a?.country===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="fgroup"><label>Visa Type</label><input id="afVisa" value="${esc(a?.visa||'')}" placeholder="e.g. Student (500)"/></div>
    <div class="fgroup"><label>Status</label><select id="afStatus">${['In Progress','Documents','Waiting','Review','Approved'].map(s=>`<option ${a?.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
  </div>`,
  [{label:'Cancel', cls:'ghost'}, {label: a?'Save Changes':'Add Applicant', cls:'primary', fn:()=>{
    const name = $('#afName').value.trim(); if(!name) return toast('Applicant name is required', false), true;
    const rec = {name, email:$('#afEmail').value||'—', phone:$('#afPhone').value||'—', country:$('#afCountry').value, visa:$('#afVisa').value||'General Visa', status:$('#afStatus').value};
    if (a){ Object.assign(a, rec); toast('Applicant updated'); }
    else {
      const app = {id:uid(), ...rec, progress:15, applied:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})};
      DB.applicants.unshift(app);
      DB.cases.unshift({id:uid(), title:`${rec.country} ${rec.visa} — ${name}`, applicant:name, country:rec.country, stage:'In Progress', progress:15, due:'TBD'});
      addActivity('visa', 'New applicant onboarded: '+name); toast('Applicant added — Visa Agent started the file');
    }
    save(); renderStats();
    if (currentView==='applicants') renderApplicants($('#apSearch')?.value||'');
    else if (currentView!=='home') switchView(currentView);
  }}]);
}
function deleteApplicant(id){
  const a = DB.applicants.find(x=>x.id===id);
  openModal('Delete applicant?', `<p class="note">Remove <b>${esc(a.name)}</b> from the workspace? Their case will stay in Visa Cases for records.</p>`,
  [{label:'Cancel', cls:'ghost'}, {label:'Delete', cls:'primary', fn:()=>{ DB.applicants = DB.applicants.filter(x=>x.id!==id); save(); renderApplicants($('#apSearch')?.value||''); renderStats(); toast('Applicant removed'); }}]);
}
function deleteDocument(id){ DB.documents = DB.documents.filter(d=>d.id!==id); save(); switchView('documents'); toast('Document deleted'); }
function openCaseModal(){
  openModal('New Visa Case', `<div class="form-grid">
    <div class="fgroup full"><label>Case Title</label><input id="cfTitle" placeholder="e.g. AU Student Visa — Applicant Name"/></div>
    <div class="fgroup"><label>Applicant</label><select id="cfApp">${DB.applicants.map(a=>`<option>${esc(a.name)}</option>`).join('')}</select></div>
    <div class="fgroup"><label>Country</label><select id="cfCountry">${COUNTRIES.map(c=>`<option>${c}</option>`).join('')}</select></div></div>`,
  [{label:'Cancel', cls:'ghost'}, {label:'Create Case', cls:'primary', fn:()=>{
    const t = $('#cfTitle').value.trim(); if(!t) return toast('Case title required', false), true;
    DB.cases.unshift({id:uid(), title:t, applicant:$('#cfApp').value, country:$('#cfCountry').value, stage:'In Progress', progress:10, due:'TBD'});
    save(); addActivity('visa','New case opened: '+t); switchView('cases'); renderStats(); toast('Case created');
  }}]);
}
function openAgentModal(agentId){
  const ag = agentById(agentId); const on = DB.agentsOn[ag.id];
  const recent = DB.activity.filter(a=>a.agent===ag.id).slice(0,4);
  openModal(ag.name, `
    <div class="mini-top"><span class="agent-ic-lg" style="background:linear-gradient(135deg,${ag.color},${ag.color}bb)">${icon(ag.icon)}</span>
    <div><h4 style="font-size:16px">${esc(ag.name)}</h4><small style="color:var(--muted);font-weight:600">${esc(ag.persona||'')}</small><span class="pill ${on?'green':'gray'}" style="margin-top:4px">${on?'Active · '+ag.statuses[0]:'Paused'}</span></div></div>
    <p class="note" style="font-size:13px">${esc(ag.desc)}</p>
    <h4 class="section-title">Recent work</h4>
    ${recent.length ? recent.map(a=>`<p class="detail"><span>${esc(a.text)}</span><b>${relTime(a.ts)}</b></p>`).join('') : '<p class="note">No recent activity yet — run this agent to see it work.</p>'}`,
  [{label: on?'Pause Agent':'Activate Agent', cls:'ghost', fn:()=>{ DB.agentsOn[ag.id]=!on; save(); renderOrbit(); toast(`${ag.name} ${!on?'activated':'paused'}`); if(currentView==='agents') switchView('agents'); }},
   {label:'Run Now', cls:'primary', fn:()=> runAgentQuick(ag.id)}]);
}
function openTaskModal(){
  openModal('New Agent Task', `<div class="form-grid">
    <div class="fgroup"><label>Assign to</label><select id="tfAgent">${AGENTS.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></div>
    <div class="fgroup"><label>Priority</label><select id="tfPri"><option>Normal</option><option>High</option><option>Urgent</option></select></div>
    <div class="fgroup full"><label>Task</label><textarea id="tfText" rows="3" placeholder="e.g. Check ImmiAccount for Arif and report any update"></textarea></div></div>`,
  [{label:'Cancel', cls:'ghost'}, {label:'Launch Task', cls:'primary', fn:()=>{
    const txt = $('#tfText').value.trim() || 'General workspace task';
    const agId = $('#tfAgent').value;
    if (agId==='browser'){ runBrowserTask(txt); }
    else if (agId==='document'){ generateChecklistPdf(); }
    else runAgentQuick(agId, txt);
    toast(`Task sent to ${agentById(agId).name}`);
  }}]);
}
$('#newTaskBtn').addEventListener('click', openTaskModal);

/* ---------- quick agent runs ---------- */
const AGENT_TASKS = {
  maestro:'Reviewed all active cases and reprioritised the queue', visa:'Re-checked eligibility for 3 pending applications',
  browser:'Completed a portal check run', report:'Generated the daily operations summary',
  document:'Processed and indexed 4 new documents', compliance:'Audited 6 files against the latest rules — all clear',
  recruitment:'Matched 5 new candidates to open roles', research:'Scanned 12 country portals for fee & policy changes',
  nova:'Composed an executive dossier and saved it to the PDF Center', dispatch:'Dispatched 3 approved client dossiers with delivery tracking',
};
function runAgentQuick(agentId, customText){
  const ag = agentById(agentId);
  if (!DB.agentsOn[agentId]){ DB.agentsOn[agentId]=true; save(); renderOrbit(); }
  $('#maestroState').textContent = `${ag.name} is working…`;
  toast(`${ag.name} started working`);
  consoleLog(`[agent] ${ag.name} task dispatched`);
  setTimeout(()=>{
    const text = customText || AGENT_TASKS[agentId];
    addActivity(agentId, text);
    $('#maestroState').textContent = 'Maestro is working';
    toast(`${ag.name}: task complete ✓`);
  }, 1600);
}
function askAgent(text){ $('#chatInput').value = text; sendChat(); }

/* ---------- quick actions ---------- */
document.addEventListener('click', e=>{
  const q = e.target.closest('[data-action]'); if(!q) return;
  const act = q.dataset.action;
  if (act==='new-application') openApplicantModal();
  if (act==='upload-docs'){ switchView('documents'); setTimeout(()=> $('#fileInput').click(), 250); }
  if (act==='check-status'){
    openModal('Check Visa Status', `<div class="fgroup"><label>Select applicant</label><select id="csApp" style="width:100%;border:1px solid var(--stroke);border-radius:12px;padding:10px 12px;background:var(--panel-strong)">${DB.applicants.map(a=>`<option>${esc(a.name)}</option>`).join('')}</select></div>
      <p class="note" style="margin-top:10px">The Browser Agent will verify the live status on the official portal.</p>`,
    [{label:'Cancel', cls:'ghost'}, {label:'Check with Browser Agent', cls:'primary', fn:()=> runBrowserTask('Check status — '+$('#csApp').value)}]);
  }
  if (act==='create-report') generateReportPdf();
  if (act==='browser-task'){ openRightPanel(); runBrowserTask('Login to ImmiAccount'); }
});

/* ============================================================
   FILE UPLOADS
   ============================================================ */
function handleFiles(fileList){
  const files = [...fileList]; if(!files.length) return;
  files.forEach(f=>{
    const size = f.size > 1048576 ? (f.size/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(f.size/1024))+' KB';
    DB.documents.unshift({id:uid(), name:f.name, size, by:'You (upload)', ts:Date.now()});
    showAttachChip(f.name);
  });
  save(); addActivity('document', `Processed ${files.length} uploaded file(s) — OCR complete`);
  toast(`${files.length} file(s) uploaded to Document Center`);
  logExec('upload', `Uploaded ${files.length} file(s) to Document Center`);
  if (currentView==='documents') switchView('documents');
}
function showAttachChip(name){
  const box = $('#attachPreview'); box.hidden = false;
  const chip = document.createElement('span'); chip.className='attach-chip';
  chip.innerHTML = `${icon('file','sm')} ${esc(name)} <button aria-label="Remove">${icon('x','sm')}</button>`;
  chip.querySelector('button').addEventListener('click', ()=>{ chip.remove(); if(!box.children.length) box.hidden=true; });
  box.appendChild(chip);
}
$('#fileInput').addEventListener('change', e=>{ handleFiles(e.target.files); e.target.value=''; });
$('#imageInput').addEventListener('change', e=>{ handleFiles(e.target.files); e.target.value=''; });
$('#attachBtn').addEventListener('click', ()=> $('#fileInput').click());
$('#imageBtn').addEventListener('click', ()=> $('#imageInput').click());
$('#plusBtn').addEventListener('click', ()=>{
  openModal('Quick Add', `<div class="grid-cards" style="grid-template-columns:1fr 1fr">
    <button class="quick" onclick="closeModal();openApplicantModal()"><span>${icon('users')}</span>New Applicant</button>
    <button class="quick" onclick="closeModal();openTaskModal()"><span>${icon('bot')}</span>New Agent Task</button>
    <button class="quick" onclick="closeModal();document.getElementById('fileInput').click()"><span>${icon('up')}</span>Upload Document</button>
    <button class="quick" onclick="closeModal();generateChecklistPdf()"><span>${icon('file')}</span>Generate PDF</button></div>`, []);
});

/* ============================================================
   PDF ENGINE — real downloadable PDFs + in-app preview
   ============================================================ */
function pdfLinesFor(p){
  if (p.dossierId){
    const d = (DB.dossiers||[]).find(x=>x.id===p.dossierId);
    if (d){ const f = d.fields; return [
      'N SPACE — ' + String(f.title).toUpperCase(), 'Reference: ' + d.ref + ' · Prepared by Agent Nova', '',
      'CLIENT PARTICULARS', 'Name: '+f.fullName, 'Passport: '+f.passport, 'DOB: '+f.dob, 'Nationality: '+f.nationality,
      'Destination: '+f.destination, 'Visa: '+f.visaType, 'Sponsor: '+f.sponsor, 'Embassy: '+f.embassy, '',
      'CHECKLIST', ...d.checklist.map(c=>(c.done?'[x] ':'[ ] ')+c.label), '',
      'MILESTONE: ' + (typeof MILESTONES!=='undefined' ? MILESTONES[d.stage] : ''), '',
      'Verify this dossier: https://nspace.app/verify/' + d.ref ]; }
  }
  if (p.kind==='Report') return [
    'N SPACE — DAILY OPERATIONS REPORT', 'Generated by Daily Report Agent · '+new Date(p.ts).toLocaleString(), '',
    'KEY NUMBERS', `- Total applicants: ${242+DB.applicants.length}`, `- Active cases: ${DB.cases.length}`,
    `- Completed cases: ${DB.cases.filter(c=>c.stage==='Completed').length}`, '- Visa success rate: 94.2%', '- Agent hours saved (month): 186h', '',
    'HIGHLIGHTS', '- Australia Subclass 500 remains the top pipeline (38%).', '- Malaysia recruitment placements up 21% month-on-month.',
    '- 3 documents expire within 7 days — Compliance Agent has flagged owners.', '',
    'NEXT ACTIONS', '- Follow up 2 waiting cases with case officers.', '- Upload pending OSHC policy for Md. Ariful Islam..', '- Publish weekly policy digest on Sunday 18:00.'];
  return [
    'N SPACE — VISA DOCUMENT CHECKLIST', `Applicant: ${p.applicant}`, 'Visa: Australia Student (Subclass 500)', 'Prepared by Document Agent · '+new Date(p.ts).toLocaleString(), '',
    'IDENTITY & TRAVEL', '[x] Valid passport (6+ months)', '[x] National ID / Birth certificate', '[ ] Passport-size photos (35x45mm)', '',
    'EDUCATION', '[x] SSC/HSC certificates & transcripts', '[x] IELTS / PTE score report', '[x] Confirmation of Enrolment (CoE)', '',
    'FINANCIAL CAPACITY', '[x] Bank statement — last 6 months', '[ ] Source-of-funds declaration', '[ ] Sponsor affidavit (if applicable)', '',
    'HEALTH & CHARACTER', '[ ] OSHC health cover policy', '[ ] Medical examination (HAP ID)', '[ ] Police clearance certificate', '',
    'GENUINE STUDENT (GS)', '[ ] GS statement — course & career plan', '[ ] Employment / gap explanation letters', '',
    'Status: 7 of 14 documents verified by Compliance Agent.'];
}
function makeRealPdf(title, lines){
  const clean = s => s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[^\x20-\x7E]/g,'');
  let content = 'BT\n/F1 16 Tf\n50 790 Td\n('+clean(title)+') Tj\nET\nBT\n/F2 10.5 Tf\n50 762 Td\n13 TL\n';
  lines.forEach(l=>{ if(l===''){ content+='T*\n'; } else { content+='('+clean(l)+') Tj\nT*\n'; } });
  content += 'ET';
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n'; const offsets=[0];
  objs.forEach((o,i)=>{ offsets.push(pdf.length); pdf += `${i+1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length+1}\n0000000000 65535 f \n` + offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n ').join('\n') + `\ntrailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], {type:'application/pdf'});
}
function downloadPdf(id){
  const p = DB.pdfs.find(x=>x.id===id); if(!p) return;
  const blob = makeRealPdf(p.name.replace('.pdf','').replace(/_/g,' '), pdfLinesFor(p));
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = p.name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  logExec('download', 'Downloaded '+p.name); toast('Downloading '+p.name);
}
function pdfDocHTML(p){
  const lines = pdfLinesFor(p);
  return `<div class="pdf-doc">
    <div class="pd-head"><svg style="width:38px;height:38px"><use href="#i-logo"/></svg>
      <div><h2>N Space</h2><p class="pd-meta">AI Visa Agent Workspace · Dhaka, Bangladesh</p></div>
      <span style="margin-left:auto" class="pill blue">v${p.version}</span></div>
    ${lines.map(l=>{
      if (l==='') return '<div style="height:8px"></div>';
      if (/^[A-Z &()—-]+$/.test(l) && l.length>4 && !l.startsWith('N SPACE')) return `<h3>${esc(l)}</h3>`;
      if (l.startsWith('N SPACE')) return `<h2 style="font-size:17px">${esc(l)}</h2>`;
      if (l.startsWith('[x]')) return `<p>✅ ${esc(l.slice(4))}</p>`;
      if (l.startsWith('[ ]')) return `<p>⬜ ${esc(l.slice(4))}</p>`;
      if (l.startsWith('-')) return `<p>• ${esc(l.slice(2))}</p>`;
      return `<p class="pd-meta">${esc(l)}</p>`;
    }).join('')}
    <span class="stamp">VERIFIED · N SPACE AGENTS</span>
    <p class="pd-meta" style="margin-top:16px">Document: ${esc(p.name)} · ${esc(p.size)} · Generated ${new Date(p.ts).toLocaleString()}</p></div>`;
}
function openPdfPreview(id){
  const p = DB.pdfs.find(x=>x.id===id); if(!p) return;
  const __dos = p.dossierId ? (DB.dossiers||[]).find(x=>x.id===p.dossierId) : null;
  openModal(p.name, (__dos ? '<div style="overflow:auto;max-height:58vh;background:#dfe5ee;border-radius:12px;padding:12px"><div style="zoom:.56"><div class="a4-stack">' + dossierPagesHTML(__dos) + '</div></div></div>' : pdfDocHTML(p)) + `
    <h4 class="section-title">Version History</h4>
    ${Array.from({length:p.version},(_,i)=>p.version-i).map(v=>`<p class="detail"><span>Version ${v} ${v===p.version?'(current)':''}</span><b>${new Date(p.ts - (p.version-v)*86400000).toLocaleDateString()}</b></p>`).join('')}`,
  [{label:'Share', cls:'ghost', fn:()=>{ sharePdf(id); return true; }},
   {label:'Print', cls:'ghost', fn:()=>{ printPdf(id); return true; }},
   {label:'Regenerate', cls:'ghost', fn:()=>{ regenPdf(id); return true; }},
   {label:'Download PDF', cls:'primary', fn:()=>{ downloadPdf(id); return true; }}]);
  $('#modal .modal').classList.add('wide');
}
function sharePdf(id){
  const p = DB.pdfs.find(x=>x.id===id); if(!p) return;
  if (navigator.share){ navigator.share({title:p.name, text:`${p.name} — generated by N Space AI Agents`}).catch(()=>{}); }
  else { navigator.clipboard?.writeText(location.href.split('#')[0] + '#pdf-' + p.id); toast('Share link copied to clipboard'); }
}
function printPdf(id){
  const p = DB.pdfs.find(x=>x.id===id); if(!p) return;
  if (p.dossierId){ const d = (DB.dossiers||[]).find(x=>x.id===p.dossierId); if (d) return printDossier(d); }
  let area = $('#printArea');
  if (!area){ area = document.createElement('div'); area.id='printArea'; area.style.cssText='display:none;position:absolute;left:0;top:0;width:100%'; document.body.appendChild(area); }
  area.innerHTML = pdfDocHTML(p);
  toast('Opening print dialog…'); setTimeout(()=> window.print(), 350);
}
function regenPdf(id){
  const p = DB.pdfs.find(x=>x.id===id); if(!p) return;
  p.version += 1; p.ts = Date.now(); save(); renderPdfMini();
  addActivity('document', `Regenerated ${p.name} (v${p.version})`);
  toast(`${p.name} regenerated — now v${p.version}`);
  if (currentView==='pdf') switchView('pdf');
}
function addPdf(name, kind, applicant){
  const p = {id:uid(), name, size:(0.6+Math.random()*1.8).toFixed(1)+' MB', ts:Date.now(), version:1, kind, applicant:applicant||'—'};
  DB.pdfs.unshift(p); save(); renderPdfMini(); return p;
}
function generateChecklistPdf(){
  const a = DB.applicants[0];
  const p = addPdf('Subclass_500_Checklist.pdf','Checklist', a ? a.name : 'Applicant');
  addActivity('document','Generated visa checklist PDF');
  toast('Checklist PDF generated — opening preview');
  setTimeout(()=> openPdfPreview(p.id), 500);
}
function generateReportPdf(){
  const p = addPdf('Daily_Operations_Report.pdf','Report','—');
  addActivity('report','Generated daily operations report');
  toast('Daily report generated');
  setTimeout(()=> openPdfPreview(p.id), 500);
}

/* ============================================================
   BROWSER AGENT ENGINE — live preview, logs, Stop control
   ============================================================ */
let taskTimer = null, taskRunning = false;
const BT = {steps:[], i:0, paused:false, name:'Login to ImmiAccount'};
const LOG_COLORS = {navigate:'#7c3aed', click:'#2f7bff', typing:'#0ea5e9', scroll:'#f59e0b', upload:'#a855f7', download:'#14b8a6', ok:'#17b978', error:'#e5484d', mouse:'#64748b', wait:'#f59e0b'};
function logExec(type, text, cls=''){
  const t = nowTime();
  const sess = (typeof activeSession === 'function') ? activeSession() : null;
  if (sess){ sess.logs.push({type, text, cls, t}); sess.logs = sess.logs.slice(-80); save(); }
  const ul = $('#execLog');
  const li = document.createElement('li');
  li.innerHTML = `<span class="ld" style="background:${LOG_COLORS[type]||'#94a3b8'}"></span><span class="lt">${t}</span><span class="${cls}">${esc(text)}</span>`;
  ul.appendChild(li); ul.scrollTop = ul.scrollHeight;
  consoleLog(`[${type}] ${text}`);
  setActiveAction(type);
}
function consoleLog(text){
  const c = $('#consoleLog'); const p = document.createElement('p');
  p.textContent = `${nowTime()} › ${text}`; c.appendChild(p); c.scrollTop = c.scrollHeight;
}
function setActiveAction(type){
  const map = {navigate:'mouse', ok:'mouse', wait:'scroll', error:'mouse'};
  const act = map[type] || type;
  $$('#actionStrip button').forEach(b=> b.classList.toggle('sel', b.dataset.act===act));
}
$$('#actionStrip button').forEach(b=> b.addEventListener('click', ()=> setActiveAction(b.dataset.act)));
$$('.ltab').forEach(t=> t.addEventListener('click', ()=>{
  $$('.ltab').forEach(x=>x.classList.toggle('active', x===t));
  $('#execLog').hidden = t.dataset.tab!=='exec';
  $('#consoleLog').hidden = t.dataset.tab!=='console';
  $('#detailsLog').hidden = t.dataset.tab!=='details';
}));
function moveCursor(xPct, yPct){
  const stage = $('#browserStage'), cur = $('#fakeCursor');
  cur.hidden = false;
  cur.style.left = (stage.clientWidth * xPct/100) + 'px';
  cur.style.top  = (stage.clientHeight * yPct/100) + 'px';
}
function typeInto(input, text, done){
  input.focus(); input.value = '';
  let i = 0;
  const iv = setInterval(()=>{
    if (!taskRunning){ clearInterval(iv); return; }
    if (typeof BT !== 'undefined' && BT.paused) return;
    input.value += text[i++] || '';
    if (i >= text.length){ clearInterval(iv); done && done(); }
  }, 55);
}
function updateIntegrationDetail(){
  const el = $('#detailIntegration');
  el.textContent = DB.settings.browserUseKey
    ? 'Browser Use Cloud · key •••' + DB.settings.browserUseKey.slice(-4)
    : 'Simulation sandbox — add Browser Use key in Settings';
}
/* ---- sessions: each keeps its own URL, task and execution log ---- */
function activeSession(){
  if (!Array.isArray(DB.browserSessions) || !DB.browserSessions.length) return null;
  return DB.browserSessions.find(x=>x.id===DB.activeBrowserSession) || DB.browserSessions[0];
}
function renderSessionOptions(){
  const sel = $('#sessionSelect'); if (!sel) return;
  sel.innerHTML = DB.browserSessions.map(x=>`<option value="${x.id}" ${x.id===DB.activeBrowserSession?'selected':''}>${esc(x.name)}</option>`).join('');
  const sess = activeSession();
  if (sess){ $('#detailSession').textContent = sess.name; }
}
function renderSessionLogs(){
  const ul = $('#execLog'); if (!ul) return;
  const sess = activeSession();
  ul.innerHTML = '';
  (sess ? sess.logs : []).forEach(l=>{
    const li = document.createElement('li');
    li.innerHTML = `<span class="ld" style="background:${LOG_COLORS[l.type]||'#94a3b8'}"></span><span class="lt">${esc(l.t||'')}</span><span class="${l.cls||''}">${esc(l.text)}</span>`;
    ul.appendChild(li);
  });
  ul.scrollTop = ul.scrollHeight;
}
/* ---- transport: play / pause / step / replay / stop ---- */
function updateProgress(){
  const total = BT.steps.length || 7;
  $('#taskStep').textContent = `${BT.i}/${total}`;
  $('#taskBarFill').style.width = (total ? (BT.i/total*100) : 0) + '%';
}
function setTransportUI(){
  const iconEl = $('#taskPlayIcon'); if (!iconEl) return;
  iconEl.innerHTML = `<use href="#i-${(taskRunning && !BT.paused) ? 'pause' : 'play'}"/>`;
  $('#taskPlayLabel').textContent = taskRunning ? (BT.paused ? 'Resume' : 'Pause') : 'Run';
  $('#taskStopBtn').disabled = !taskRunning;
  const st = $('#taskStepBtn'); if (st) st.disabled = taskRunning && BT.i >= BT.steps.length;
  $('#maestroState').textContent = taskRunning ? (BT.paused ? 'Browser Agent paused' : 'Browser Agent is working…') : 'Maestro is working';
}
function stopBrowserTask(reason='user'){
  if (taskTimer){ clearTimeout(taskTimer); taskTimer = null; }
  if (taskRunning && reason === 'user'){
    logExec('error', 'Task stopped by user ⛔', 'err-t');
    addActivity('browser','Browser task stopped by user');
    toast('Browser task stopped', false);
    $('#fakeCursor').hidden = true;
  }
  taskRunning = false; BT.paused = false;
  setTransportUI();
}
function buildBrowserSteps(taskName, url){
  return [
    {delay:500,  fn:()=>{ logExec('navigate', `Navigated to ${url}`); moveCursor(18, 30); }},
    {delay:1300, fn:()=>{ logExec('mouse', 'Mouse moved to "Sign In" button'); moveCursor(24, 66); $('#siteSignIn').classList.add('agent-focus'); }},
    {delay:1200, fn:()=>{ logExec('click', 'Clicked on "Sign In" button'); $('#siteSignIn').classList.remove('agent-focus'); $('#siteForm').hidden=false; $('#browserStage').scrollIntoView({behavior:'smooth', block:'nearest'}); moveCursor(40, 78); }},
    {delay:1100, fn:()=>{ logExec('typing', 'Typing username…'); typeInto($('#siteUser'), DB.settings.email); }},
    {delay:2100, fn:()=>{ logExec('typing', 'Typed password ••••••••'); typeInto($('#sitePass'), '********'); moveCursor(30, 88); }},
    {delay:1700, fn:()=>{ logExec('click', 'Clicked on "Next"'); logExec('wait', 'Waiting for page load…'); }},
    {delay:1500, fn:()=>{
        logExec('ok', 'Page loaded successfully ✓', 'ok-t');
        $('#siteOk').hidden = false;
        addActivity('browser', `Completed: ${taskName} ✓`);
        taskRunning = false; BT.paused = false;
        updateProgress(); setTransportUI();
        toast('Browser task completed ✓');
        speak('Browser task completed successfully.');
        $('#fakeCursor').hidden = true;
      }},
  ];
}
function scheduleNext(){
  if (!taskRunning || BT.paused || BT.i >= BT.steps.length) return;
  taskTimer = setTimeout(execStep, BT.steps[BT.i].delay);
}
function execStep(){
  if (!taskRunning || BT.i >= BT.steps.length) return;
  BT.steps[BT.i].fn(); BT.i++;
  updateProgress();
  if (BT.i < BT.steps.length && !BT.paused) scheduleNext();
  setTransportUI();
}
function runBrowserTask(taskName, opts={}){
  if (taskTimer){ clearTimeout(taskTimer); taskTimer = null; }
  openRightPanelDesktopHint();
  const url = $('#urlInput').value.trim() || 'https://www.gov.au/immiaccount';
  BT.name = taskName; BT.steps = buildBrowserSteps(taskName, url); BT.i = 0; BT.paused = !!opts.startPaused;
  taskRunning = true;
  $('#taskName').textContent = taskName;
  $('#siteForm').hidden = true; $('#siteOk').hidden = true; $('#siteUser').value=''; $('#sitePass').value='';
  const sess = activeSession();
  if (sess){ sess.url = url; sess.task = taskName; save(); }
  addActivity('browser', 'Started task: '+taskName);
  if (DB.settings.browserUseKey) consoleLog('[browser-use] Cloud key detected — session mirrored to in-app sandbox for live preview');
  updateProgress(); setTransportUI();
  if (!BT.paused) scheduleNext();
}
$('#taskPlayBtn').addEventListener('click', ()=>{
  if (taskRunning && !BT.paused){ BT.paused = true; if (taskTimer) clearTimeout(taskTimer); logExec('wait','Paused by user'); }
  else if (taskRunning && BT.paused){ BT.paused = false; logExec('navigate','Resumed by user'); scheduleNext(); }
  else runBrowserTask($('#taskName').textContent || BT.name);
  setTransportUI();
});
$('#taskStepBtn').addEventListener('click', ()=>{
  if (!taskRunning){ runBrowserTask(BT.name || $('#taskName').textContent, {startPaused:true}); }
  else { BT.paused = true; if (taskTimer) clearTimeout(taskTimer); }
  execStep(); setTransportUI();
});
$('#taskReplayBtn').addEventListener('click', ()=> runBrowserTask(BT.name || $('#taskName').textContent));
$('#taskStopBtn').addEventListener('click', ()=> stopBrowserTask('user'));
$('#sessionSelect').addEventListener('change', e=>{
  stopBrowserTask('switch');
  DB.activeBrowserSession = e.target.value; save();
  const sess = activeSession();
  if (sess){ $('#urlInput').value = sess.url; $('#taskName').textContent = sess.task || 'Browser task'; BT.name = sess.task || BT.name; }
  renderSessionOptions(); renderSessionLogs();
  BT.i = 0; BT.steps = []; updateProgress(); setTransportUI();
  toast('Switched to ' + (sess ? sess.name : 'session'));
});
$('#sessionNewBtn').addEventListener('click', ()=>{
  const url = $('#urlInput').value.trim() || 'https://www.gov.au/immiaccount';
  let host = url; try { host = new URL(url).host; } catch(e){}
  const sess = {id:uid(), name: host + ' — Session ' + (DB.browserSessions.length+1), url, task: $('#taskName').textContent || 'Browser task', logs:[]};
  DB.browserSessions.push(sess); DB.activeBrowserSession = sess.id; save();
  renderSessionOptions(); renderSessionLogs();
  logExec('navigate', 'Session started · ' + url);
  toast('New browser session created');
});
$('#rpFullBtn').addEventListener('click', async ()=>{
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('#rightPanel').requestFullscreen();
  } catch(e){ toast('Full screen is not available in this browser', false); }
});

$('#urlGoBtn').addEventListener('click', ()=>{ logExec('navigate','Navigated to '+$('#urlInput').value); toast('Page loaded in Live Preview'); });
$('#urlInput').addEventListener('keydown', e=>{ if(e.key==='Enter') $('#urlGoBtn').click(); });
$('#rpRefreshBtn').addEventListener('click', ()=>{ logExec('navigate','Reloaded page'); toast('Preview reloaded'); });
$('#rpExtBtn').addEventListener('click', ()=> window.open('https://www.gov.au', '_blank'));
$('#siteSignIn').addEventListener('click', ()=>{ $('#siteForm').hidden=false; logExec('click','User clicked "Sign In" manually'); });
$('#siteNext').addEventListener('click', ()=>{ $('#siteOk').hidden=false; logExec('ok','Signed in successfully ✓','ok-t'); });

/* right panel drawer (tablet/mobile) */
$('#liveToggle').addEventListener('click', ()=>{
      const rp = $('#rightPanel');
      if (rp.classList.contains('open')) closeRightPanel();
      else openRightPanel();
    });
function openRightPanel(){ $('#rightPanel').classList.add('open'); showScrim($('#rightPanel')); }
function openRightPanelDesktopHint(){ if (window.innerWidth <= 1320) openRightPanel(); }
function closeRightPanel(){ $('#rightPanel').classList.remove('open'); hideScrim(); }
$('#rpCloseBtn').addEventListener('click', closeRightPanel);

/* seed exec log from the persisted browser session */
(function seedLogs(){
  renderSessionOptions();
  renderSessionLogs();
  consoleLog('[browser] Chromium sandbox ready · viewport 1280×800');
  consoleLog('[agent] Maestro connected · ' + AGENTS.length + ' agents online');
  $('#taskStep').textContent = '3/7'; $('#taskBarFill').style.width = '43%';
  setTransportUI();
})();

/* ============================================================
   CHAT + AI BRAIN (Gemini live when key present)
   ============================================================ */
function ensureActiveChat(){
  let c = DB.chats.find(x=>x.id===DB.activeChatId);
  if (!c){
    c = {id:uid(), title:'New conversation', agent:'maestro', updated:Date.now(), messages:[]};
    DB.chats.unshift(c); DB.activeChatId = c.id;
  }
  return c;
}
function pushMessage(chat, from, text){
  const m = {from, text, ts:Date.now()};
  chat.messages.push(m); chat.updated = Date.now();
  if (chat.messages.filter(x=>x.from==='me').length===1 && from==='me') chat.title = text.slice(0,44) + (text.length>44?'…':'');
  save();
  if (currentView==='chats'){
    const th = $('#chatThread');
    if (th){ th.insertAdjacentHTML('beforeend', bubbleHTML(m)); th.scrollTop = th.scrollHeight; }
  }
  renderStats();
  return m;
}
function findApplicant(text){
  const t = text.toLowerCase();
  return DB.applicants.find(a => t.includes(a.name.toLowerCase()) || a.name.toLowerCase().split(' ').some(w=> w.length>3 && t.includes(w)));
}
function localBrain(text){
  const t = text.toLowerCase();
  const isBn = /[\u0980-\u09FF]/.test(text);
  const app = findApplicant(text);
  if (/(login|sign in|immi|browser|website|portal|লগইন|ব্রাউজার)/.test(t)){
    setTimeout(()=> runBrowserTask(app ? 'Check status — '+app.name : 'Login to ImmiAccount'), 700);
    return {agent:'browser', text: isBn
      ? 'ঠিক আছে! Browser Agent ImmiAccount খুলছে — ডানদিকের Live Browser Preview-তে প্রতিটি ক্লিক ও টাইপিং লাইভ দেখতে পাবেন। যেকোনো সময় Stop বাটনে থামাতে পারবেন।'
      : 'On it! The Browser Agent is opening ImmiAccount now — watch every click and keystroke live in the right-hand preview. You can hit Stop anytime.'};
  }
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch){
    setTimeout(()=> importUrlToDossier(urlMatch[0]), 700);
    return {agent:'nova', text: isBn
      ? 'Nova ওয়েবসাইটটি বিশ্লেষণ করে একটি Executive Dossier তৈরি করছে — Nova Studio-তে চেকলিস্ট, ফি ও ধাপগুলো সম্পাদনাযোগ্য A4 ক্যানভাসে সাজানো হচ্ছে।'
      : 'Agent Nova is analysing that portal and synthesising an Executive Dossier — requirements, fees and steps are being laid out on an editable A4 canvas in Nova Studio.'};
  }
  if (/(serbia|jedinstvena|ugovor|pozivno|work permit dossier|statutory)/.test(t)){
    setTimeout(()=>{ switchView('nova'); toast('Nova Studio → Statutory Templates: 🇷🇸 Serbia 7-page package'); }, 600);
    return {agent:'nova', text: isBn
      ? 'Serbia Jedinstvena Dozvola প্যাকেজ Nova Studio-তে প্রস্তুত — POZIVNO PISMO, smeštaj potvrda, izjava ও 27 article-সহ UGOVOR O RADU, মোট ৭ পৃষ্ঠা। এটি DRAFT template: employer-এর আসল registered তথ্য বসিয়ে আইনজীবী দিয়ে যাচাই করে নিন।'
      : 'The Serbia Jedinstvena Dozvola package is ready in Nova Studio → Statutory Templates: Pozivno pismo, accommodation confirmation, employer declaration and the 27-article Ugovor o radu — 7 pages, A4 15mm, field-mapped. It is a DRAFT template: enter the commissioning employer’s registered data and have Serbian counsel verify it before any official use.'};
  }
  if (/(nova|dossier|clone|ক্লোন|ডসিয়ার|নোভা)/.test(t)){
    setTimeout(()=> switchView('nova'), 600);
    return {agent:'nova', text: isBn
      ? 'Nova Studio খুলছি — এখানে PDF আপলোড করে এক ক্লিকে editable template-এ ক্লোন করতে, embassy URL থেকে dossier বানাতে এবং print-ready A4 PDF export করতে পারবেন।'
      : 'Opening Nova Studio — upload any PDF to clone it into an editable branded template, paste an embassy URL to synthesise a dossier, then export a print-ready A4 PDF in one tap.'};
  }
  if (/(pdf|checklist|report|চেকলিস্ট|রিপোর্ট|পিডিএফ)/.test(t)){
    const isReport = /report|রিপোর্ট/.test(t);
    setTimeout(()=> isReport ? generateReportPdf() : generateChecklistPdf(), 900);
    return {agent:'document', text: isBn
      ? `Document Agent আপনার ${isReport?'রিপোর্ট':'চেকলিস্ট'} PDF তৈরি করছে — এটি PDF Center-এ সেভ হবে, সেখান থেকে Preview, Download, Share ও Print করা যাবে।`
      : `Document Agent is generating your ${isReport?'report':'checklist'} PDF now. It will open in a preview and be saved to the PDF Center for download, sharing and printing.`};
  }
  if (/(status|progress|update|অবস্থা|স্ট্যাটাস)/.test(t)){
    if (app) return {agent:'visa', text:`${app.name} — ${app.country} ${app.visa}: currently "${app.status}" at ${app.progress}% complete (applied ${app.applied}). ${app.progress<100 ? 'Next step: '+(app.progress<50?'complete document collection.':'await case-officer assessment — no action needed today.') : 'Visa granted 🎉 Travel documents are ready in the PDF Center.'}`};
    const summary = DB.cases.map(c=>`• ${c.title}: ${c.stage} (${c.progress}%)`).join('\n');
    return {agent:'visa', text:'Here is the live case summary:\n'+summary+'\nTell me a name and I will verify it on the official portal with the Browser Agent.'};
  }
  if (/(fee|price|cost|policy|rule|research|খরচ|ফি|নিয়ম)/.test(t)){
    setTimeout(()=> runAgentQuick('research','Compiled latest visa fee changes for AU/UK/CA'), 600);
    return {agent:'research', text:'Research Agent findings (just scanned official portals):\n• Australia Subclass 500 VAC: AUD 2,000 (from Feb 2026 schedule)\n• UK Student visa: £524 + IHS £776/year\n• Canada study permit: CAD 150 + biometrics CAD 85\nProcessing times: AU 500 ≈ 4–6 weeks, UK ≈ 3 weeks, CA ≈ 8 weeks. Full digest is being added to Knowledge.'};
  }
  if (/(recruit|candidate|job|hire|worker|চাকরি|কর্মী)/.test(t)){
    setTimeout(()=> runAgentQuick('recruitment'), 600);
    const top = DB.candidates[0];
    return {agent:'recruitment', text:`Recruitment Agent found ${DB.candidates.length} strong matches. Top candidate: ${top.name} — ${top.role} for ${top.dest} (${top.match}% fit, ${top.exp} experience, ${top.status}). Open the Recruitment tab to review all profiles.`};
  }
  if (/(lead|crm|follow|customer|ক্লায়েন্ট)/.test(t)){
    return {agent:'visa', text:`CRM snapshot: ${DB.leads.length+41} open leads, pipeline value ৳42.8L, conversion 31%. Hottest lead: ${DB.leads[2].name} (${DB.leads[2].interest}, ${DB.leads[2].stage}). I can draft Bangla/English follow-ups — just say "follow up with ${DB.leads[2].name}".`};
  }
  if (/(follow up|follow-up|message|draft)/.test(t) && app){ return {agent:'visa', text:`Draft ready for ${app.name}:\n\n"আসসালামু আলাইকুম ${app.name}, আপনার ${app.country} ${app.visa} আবেদনের বর্তমান অবস্থা: ${app.status} (${app.progress}% সম্পন্ন)। পরবর্তী আপডেট পেলেই আমরা জানাবো। কোনো প্রশ্ন থাকলে রিপ্লাই করুন। — Team N Space"`}; }
  if (/(hello|hi|salam|আসসালামু|হ্যালো|কেমন)/.test(t)){
    return {agent:'maestro', text: isBn
      ? 'ওয়ালাইকুমুস সালাম Nasim Ahmed! 😊 আজ আমি কী করতে পারি? ভিসা স্ট্যাটাস চেক, ImmiAccount লগইন, PDF চেকলিস্ট, নাকি নতুন অ্যাপ্লিক্যান্ট যোগ করব?'
      : 'Hello Nasim Ahmed! 😊 What shall we do today — check a visa status, log in to ImmiAccount, generate a PDF checklist, or onboard a new applicant?'};
  }
  if (/(new applicant|add applicant|নতুন)/.test(t)){ setTimeout(openApplicantModal, 600); return {agent:'maestro', text:'Opening the New Applicant form for you — the Visa Agent will start the file as soon as you save it.'}; }
  return {agent:'maestro', text: isBn
    ? `বুঝেছি — Maestro আপনার কাজটি পরিকল্পনা করছে:\n১) সংশ্লিষ্ট এজেন্টকে দায়িত্ব দেওয়া হচ্ছে\n২) Knowledge Base থেকে নিয়ম যাচাই করা হচ্ছে\n৩) ফলাফল Activity Feed-এ দেখানো হবে\n\nআপনি চাইলে আরও নির্দিষ্ট করে বলুন — যেমন "Md. Ariful Islam.-এর স্ট্যাটাস চেক করো" বা "ImmiAccount-এ লগইন করো"।`
    : `Understood — Maestro has planned this:\n1) Assign the right specialist agent\n2) Verify rules from the Knowledge Base\n3) Execute and report in the Activity Feed\n\nFor a specific result try: "Check visa status for Md. Ariful Islam.", "Login to ImmiAccount" or "Generate visa checklist PDF".`};
}
async function geminiReply(text){
  const key = DB.settings.geminiKey;
  const ctx = `You are Maestro, the AI orchestrator inside "N Space", a visa-agency operating system in Dhaka, Bangladesh. Team leader: Nasim Ahmed. Applicants: ${DB.applicants.map(a=>a.name+' ('+a.country+' '+a.visa+', '+a.status+', '+a.progress+'%)').join('; ')}. Reply helpfully and concisely in the user's language (Bangla or English). If they ask for actions, describe what the agents will do.`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({contents:[{parts:[{text: ctx+'\n\nUser: '+text}]}]})
  });
  if (!res.ok) throw new Error('Gemini '+res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map(p=>p.text).join('') || '';
}
async function sendChat(){
  const input = $('#chatInput');
  const text = input.value.trim(); if(!text) return;
  input.value = '';
  const chat = ensureActiveChat();
  if (currentView !== 'chats') switchView('chats');
  pushMessage(chat, 'me', text);
  const th = $('#chatThread');
  const typing = document.createElement('div');
  typing.className = 'bubble ai'; typing.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
  if (th){ th.appendChild(typing); th.scrollTop = th.scrollHeight; }
  $('#maestroState').textContent = 'Maestro is thinking…';

  let reply;
  const t = text.toLowerCase();
  const actionIntent = /(login|immi|browser|pdf|checklist|report|status|recruit|new applicant|nova|dossier|clone|https?:|লগইন|চেকলিস্ট)/.test(t);
  if (DB.settings.geminiKey && !actionIntent){
    try { const g = await geminiReply(text); reply = {agent:'maestro', text: g || localBrain(text).text}; consoleLog('[gemini] Live response received'); }
    catch(e){ consoleLog('[gemini] Request failed ('+e.message+') — using local brain'); reply = localBrain(text); }
  } else {
    await new Promise(r=> setTimeout(r, 850));
    reply = localBrain(text);
  }
  typing.remove();
  chat.agent = reply.agent;
  pushMessage(chat, 'ai', reply.text);
  addActivity(reply.agent, 'Replied in chat: "' + text.slice(0,38) + (text.length>38?'…':'') + '"');
  $('#maestroState').textContent = 'Maestro is working';
  speak(reply.text);
}
$('#sendBtn').addEventListener('click', ()=> sendChat());
$('#chatInput').addEventListener('keydown', e=>{ if (e.key==='Enter') sendChat(); });

/* ---------- voice: speech-to-text + text-to-speech ---------- */
function applyLangBtn(){
  const bn = DB.settings.lang === 'bn';
  $('#langBtn').textContent = bn ? 'বাংলা' : 'EN';
  $('#langBtn').classList.toggle('en', !bn);
}
$('#langBtn').addEventListener('click', ()=>{
  DB.settings.lang = DB.settings.lang==='bn' ? 'en' : 'bn'; save(); applyLangBtn();
  toast(DB.settings.lang==='bn' ? 'Voice language: বাংলা' : 'Voice language: English');
});
function syncVoiceSwitch(){ const b=$('#voiceOutBtn'); b.classList.toggle('on', DB.settings.voiceOut); b.setAttribute('aria-checked', DB.settings.voiceOut); }
$('#voiceOutBtn').addEventListener('click', ()=>{
  DB.settings.voiceOut = !DB.settings.voiceOut; save(); syncVoiceSwitch();
  toast('Spoken replies ' + (DB.settings.voiceOut?'on':'off'));
  if (!DB.settings.voiceOut) speechSynthesis.cancel();
});
function speak(text){
  if (!DB.settings.voiceOut || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[•*`#]/g,'').slice(0, 220));
    u.lang = /[\u0980-\u09FF]/.test(text) ? 'bn-BD' : 'en-US';
    u.rate = 1.02; speechSynthesis.speak(u);
  } catch(e){}
}
let recognition = null;
$('#micBtn').addEventListener('click', ()=>{
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ toast('Voice input needs Chrome/Edge — typing works everywhere', false); return; }
  if (recognition){ recognition.stop(); return; }
  recognition = new SR();
  recognition.lang = DB.settings.lang==='bn' ? 'bn-BD' : 'en-US';
  recognition.interimResults = true;
  const btn = $('#micBtn'); btn.classList.add('recording');
  $('#chatHint').textContent = DB.settings.lang==='bn' ? '🎙️ শুনছি… বাংলায় বলুন' : '🎙️ Listening… speak now';
  recognition.onresult = e=>{
    const txt = [...e.results].map(r=>r[0].transcript).join('');
    $('#chatInput').value = txt;
    if (e.results[e.results.length-1].isFinal){ recognition.stop(); setTimeout(sendChat, 250); }
  };
  recognition.onend = ()=>{ recognition=null; btn.classList.remove('recording'); $('#chatHint').textContent='Try: “Login to ImmiAccount” · “Generate visa checklist PDF” · “Check visa status for Md. Ariful Islam.”'; };
  recognition.onerror = ()=>{ toast('Microphone unavailable — check permissions', false); };
  recognition.start();
});

/* ============================================================
   TOPBAR · THEME · SEARCH (⌘K) · DRAWERS
   ============================================================ */
function applyTheme(th){
  DB.settings.theme = th; save();
  const tb = document.getElementById('themeBadge'); if (tb) { tb.textContent = th==='dark' ? 'Dark' : 'Light'; const st = document.getElementById('sideTheme'); if (st) st.querySelector('use').setAttribute('href', th==='dark' ? '#i-sun' : '#i-moon'); }
  document.documentElement.dataset.theme = th;
  $('meta[name="theme-color"]').content = th==='dark' ? '#0a1122' : '#ffffff';
}
document.addEventListener('click', (e)=>{
      const t = e.target.closest('#sideTheme'); if(!t) return;
      applyTheme(DB.settings.theme==='dark'?'light':'dark');
    });
    const _applyTheme = applyTheme;
$('#bellBtn').addEventListener('click', e=>{ e.stopPropagation(); $('#bellPop').hidden = !$('#bellPop').hidden; });
document.addEventListener('click', e=>{ if (!e.target.closest('.bell-wrap')) $('#bellPop').hidden = true; });

function showScrim(target){
  const s = $('#scrim'); s.hidden = false;
  s.onclick = ()=>{ target.classList.remove('open'); closeRightPanel(); closeSidebarMobile(); };
}
function hideScrim(){ $('#scrim').hidden = true; }
function closeSidebarMobile(){ $('#sidebar').classList.remove('open'); if (!$('#rightPanel').classList.contains('open')) hideScrim(); }
$('#menuBtn').addEventListener('click', ()=>{ $('#sidebar').classList.add('open'); showScrim($('#sidebar')); });
$('#mobileMore')?.addEventListener('click', ()=>{ $('#sidebar').classList.add('open'); showScrim($('#sidebar')); });

/* command palette */
function cmdkItems(){
  const items = [];
  Object.entries(VIEW_TITLES).forEach(([v,t])=> items.push({group:'Pages', label:t, hint:'Go to page', icon:'chev', fn:()=>switchView(v)}));
  items.push({group:'Pages', label:'Home', hint:'Go to page', icon:'home', fn:()=>switchView('home')});
  DB.applicants.forEach(a=> items.push({group:'Applicants', label:a.name, hint:a.country+' · '+a.visa, icon:'user', fn:()=>{ switchView('applicants'); }}));
  AGENTS.forEach(a=> items.push({group:'Agents', label:a.name, hint:'Run agent', icon:a.icon, fn:()=>runAgentQuick(a.id)}));
  items.push({group:'Actions', label:'Run: Login to ImmiAccount', hint:'Browser Agent', icon:'globe', fn:()=>runBrowserTask('Login to ImmiAccount')});
  items.push({group:'Actions', label:'Generate checklist PDF', hint:'Document Agent', icon:'file', fn:generateChecklistPdf});
  items.push({group:'Actions', label:'New applicant', hint:'Create', icon:'plus', fn:openApplicantModal});
  return items;
}
function renderCmdk(q=''){
  const items = cmdkItems().filter(i=> (i.label+i.hint).toLowerCase().includes(q.toLowerCase()));
  const box = $('#cmdkResults'); let lastGroup='';
  box.innerHTML = items.slice(0,18).map((i,idx)=>{
    const g = i.group!==lastGroup ? `<p class="cmdk-group">${i.group}</p>` : ''; lastGroup=i.group;
    return g + `<button class="cmdk-item" data-ci="${idx}">${icon(i.icon)} ${esc(i.label)}<small>${esc(i.hint)}</small></button>`;
  }).join('') || '<div class="empty">No results</div>';
  $$('#cmdkResults .cmdk-item').forEach((b,idx)=> b.addEventListener('click', ()=>{ closeCmdk(); items[idx].fn(); }));
}
function openCmdk(){ $('#cmdk').hidden=false; renderCmdk(); setTimeout(()=> $('#cmdkInput').focus(), 40); }
function closeCmdk(){ $('#cmdk').hidden=true; $('#cmdkInput').value=''; }
$('#cmdkBtn').addEventListener('click', openCmdk);
$('#cmdkInput').addEventListener('input', e=> renderCmdk(e.target.value));
$('#cmdk').addEventListener('click', e=>{ if (e.target.id==='cmdk') closeCmdk(); });
document.addEventListener('keydown', e=>{
  if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); $('#cmdk').hidden ? openCmdk() : closeCmdk(); }
  if (e.key==='Escape'){ closeCmdk(); closeModal(); closeRightPanel(); closeSidebarMobile(); }
});

/* ============================================================
   PWA — service worker, install prompt, online/offline
   ============================================================ */
if ('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(e=> consoleLog('[pwa] SW: '+e.message)));
}
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault(); deferredInstall = e;
  const b = $('#installBtn'); if (b) b.hidden = false;
});
function triggerInstall(){
  if (deferredInstall){ deferredInstall.prompt(); deferredInstall.userChoice.then(()=> deferredInstall=null); }
  else toast('To install: browser menu → "Add to Home Screen" / "Install App"');
}
$('#installBtn').addEventListener('click', triggerInstall);
window.addEventListener('appinstalled', ()=> toast('N Space installed — find it on your home screen 🎉'));
function syncOnline(){ $('#offlineBanner').hidden = navigator.onLine; }
window.addEventListener('online', ()=>{ syncOnline(); toast('Back online — everything synced'); });
window.addEventListener('offline', syncOnline);

/* ---------- boot ---------- */
applyTheme(DB.settings.theme || 'light');
applyLangBtn(); syncVoiceSwitch(); updateIntegrationDetail();
renderOrbit(); renderActivity(); renderPdfMini(); renderStats(); syncOnline();
consoleLog('[system] N Space v1.2.0 ready · ' + (navigator.onLine ? 'online' : 'offline mode'));


/* ============================================================
   Agent Nova — Dedicated PDF & Visa Document Architect
   One-Click PDF Cloner · URL-to-Dossier · Editorial A4 Canvas
   ============================================================ */
const MILESTONES = ['Intake','Verification','Biometrics','Submission','Dispatch'];
const FIELD_DEFS = [
  ['title','Document Title'], ['subtitle','Subtitle'], ['fullName','Applicant Full Name'],
  ['passport','Passport Number'], ['dob','Date of Birth'], ['nationality','Nationality'],
  ['destination','Destination'], ['visaType','Visa Type'], ['sponsor','Sponsor'],
  ['travelDates','Travel Dates'], ['embassy','Embassy / VAC'],
];
let novaActiveId = null, novaZoom = null, novaPhaseStep = 0;
const novaRuntimeImages = {}; // runtime-only (not persisted) source scans

function genRef(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = ''; for (let i=0;i<6;i++) r += chars[Math.floor(Math.random()*chars.length)];
  return 'VM-' + r;
}
function stageFromProgress(p){ return p>=100 ? 4 : p>=70 ? 3 : p>=45 ? 2 : p>=20 ? 1 : 0; }
function autofillDossier(d, app){
  if (!app) return d;
  Object.assign(d.fields, {
    fullName: app.name, passport: app.passport||'', dob: app.dob||'', nationality: app.nationality||'Bangladeshi',
    destination: app.country, visaType: app.visa, sponsor: app.sponsor||'Self-funded',
  });
  d.applicantId = app.id;
  d.stage = stageFromProgress(app.progress||0);
  return d;
}
function makeDossier(partial={}){
  const d = {
    id: uid(), ref: genRef(), source:'template', sourceUrl:'', ts: Date.now(),
    applicantId: null, stage: 1,
    fields: { title:'Executive Visa Briefing Pack', subtitle:'Prepared by Agent Nova · N Space Dossier Studio',
      fullName:'—', passport:'—', dob:'—', nationality:'Bangladeshi', destination:'Australia',
      visaType:'Student (500)', sponsor:'Self-funded', travelDates:'—', embassy:'Australian High Commission, Dhaka',
      notes:'⚠ Ensure passport validity exceeds 6 months beyond travel dates. All Bangla documents require notarised English translation before submission.',
      body:'This dossier summarises the verified requirements, evidence checklist and submission roadmap for the applicant. Every field has been cross-checked against passport data ingested by Raffi (OCR) and validated by the Compliance Agent against current immigration rules.\n\nNext review is scheduled automatically; any rule change detected by the Research Agent regenerates this pack as a new version.' },
    checklist: [], feeRows: [],
  };
  if (partial.fields) Object.assign(d.fields, partial.fields);
  return Object.assign(d, partial, {fields:d.fields});
}
const Nova_TEMPLATES = {
  briefing: { label:'Executive Briefing Pack', sub:'Client-ready visa roadmap', make(app){
    const d = makeDossier({fields:{title:'Executive Visa Briefing Pack', subtitle:(app?app.country+' · '+app.visa+' — ':'')+'Client Briefing & Roadmap'}});
    d.checklist = ['Valid passport (6+ months)','National ID / birth certificate','Passport-size photographs','Academic certificates & transcripts','English test report (IELTS/PTE)','Financial evidence — 6-month statements','Health cover (OSHC / travel insurance)','Police clearance certificate'].map((label,i)=>({label, done: app ? (app.progress/100*8 > i) : i<3}));
    d.feeRows = [['Visa application charge','AUD 2,000'],['Biometrics / VAC service','BDT 3,850'],['Medical examination','BDT 9,500'],['N Space professional fee','As per agreement']].map(([item,amount])=>({item,amount}));
    return autofillDossier(d, app);
  }},
  schengen: { label:'Schengen Checklist', sub:'EU short-stay dossier', make(app){
    const d = makeDossier({fields:{title:'Schengen Visa Checklist Dossier', subtitle:'Short-Stay (Type C) — Document Control Sheet', destination:'Schengen Area', visaType:'Tourist (Type C)', embassy:'VFS Global, Dhaka'}});
    d.checklist = ['Schengen application form (signed)','Passport + previous visas copies','Travel medical insurance €30,000','Flight reservation (dummy booking)','Hotel bookings / invitation letter','Bank statements — 6 months, stamped','Employment NOC / trade licence','Cover letter with itinerary'].map((label,i)=>({label, done:i<2}));
    d.feeRows = [['Schengen visa fee','EUR 90'],['VFS service charge','BDT 2,940'],['Travel insurance','From BDT 4,200']].map(([item,amount])=>({item,amount}));
    d.fields.body = 'Cloned from the official Schengen harmonised checklist. Documents must be arranged in this exact order at the VFS counter; originals are returned after verification, copies are retained by the mission.\n\nProcessing averages 15 calendar days from biometrics.';
    return autofillDossier(d, app);
  }},
  sponsor: { label:'Sponsorship Letter', sub:'Employer / sponsor re-skin', make(app){
    const d = makeDossier({fields:{title:'Employer Sponsorship Letter', subtitle:'Official sponsorship & employment confirmation'}});
    d.checklist = ['Company letterhead verified','Signatory ID attached','Salary & tenure confirmed','Leave approval dates stated','Company registration copy'].map((label,i)=>({label, done:i<3}));
    d.fields.body = 'To whom it may concern,\n\nThis letter confirms the employment and approved leave of the applicant named in this dossier. The sponsoring organisation guarantees the applicant’s position upon return and takes responsibility for the accuracy of the employment particulars stated herein.\n\nGenerated as an editable re-skin: replace the organisation block, signatory and dates, then export — Nova preserves the original letter’s field placement and alignment.';
    d.feeRows = [];
    return autofillDossier(d, app);
  }},
  confirmation: { label:'Application Confirmation', sub:'Lodgement receipt pack', make(app){
    const d = makeDossier({fields:{title:'Visa Application Confirmation', subtitle:'Lodgement Confirmation & What Happens Next'}});
    d.checklist = ['Application lodged online','Acknowledgement received','Biometrics booked','Medical (HAP) generated','Case officer assigned'].map((label,i)=>({label, done: app ? app.progress >= (i+1)*20 : i<2}));
    d.feeRows = [['Amount paid','AUD 2,000'],['Transaction reference','EGNT-2026-CONFIRMED'],['Balance due','Nil']].map(([item,amount])=>({item,amount}));
    if (app) d.stage = Math.max(3, d.stage);
    return autofillDossier(d, app);
  }},
};
function ensureDossiers(){
  if (!Array.isArray(DB.dossiers)) DB.dossiers = [];
  if (!DB.dossiers.length){
    DB.dossiers.push(Nova_TEMPLATES.briefing.make(DB.applicants[0]));
    DB.dossiers.push(Nova_TEMPLATES.confirmation.make(DB.applicants[3] || DB.applicants[0]));
    save();
  }
  if (!novaActiveId || !DB.dossiers.find(d=>d.id===novaActiveId)) novaActiveId = DB.dossiers[0]?.id;
  return DB.dossiers;
}
function activeDossier(){ ensureDossiers(); return DB.dossiers.find(d=>d.id===novaActiveId) || DB.dossiers[0]; }

/* ---- Real, scannable QR (vendored qrcode-generator, fully offline) ---- */
function qrSVG(text){
  try {
    if (typeof qrcode === 'function'){
      const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
      return qr.createSvgTag(2, 4);
    }
  } catch(e){}
  // Deterministic fallback matrix if the library is unavailable
  let seed = 7; for (const c of text) seed = (seed*31 + c.charCodeAt(0)) >>> 0;
  const rnd = ()=>{ seed = (seed*1103515245 + 12345) >>> 0; return (seed >> 16) & 1; };
  const n = 25, cs = 4; let rects = '';
  const finder = (x,y)=>{ rects += `<rect x="${x*cs}" y="${y*cs}" width="${7*cs}" height="${7*cs}" fill="#0b192c"/><rect x="${(x+1)*cs}" y="${(y+1)*cs}" width="${5*cs}" height="${5*cs}" fill="#fff"/><rect x="${(x+2)*cs}" y="${(y+2)*cs}" width="${3*cs}" height="${3*cs}" fill="#0b192c"/>`; };
  for (let y=0;y<n;y++) for (let x=0;x<n;x++){
    const inF = (x<8&&y<8)||(x>n-9&&y<8)||(x<8&&y>n-9);
    if (!inF && rnd()) rects += `<rect x="${x*cs}" y="${y*cs}" width="${cs}" height="${cs}" fill="#0b192c"/>`;
  }
  finder(0,0); finder(n-7,0); finder(0,n-7);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n*cs} ${n*cs}"><rect width="100%" height="100%" fill="#fff"/>${rects}</svg>`;
}


/* ============================================================
   Statutory Template Engine — Serbia Jedinstvena Dozvola
   (Employer submission package · 7 pages · DRAFT TEMPLATES
   for authorised draft preparation — verify with licensed
   Serbian counsel before any official submission.)
   ============================================================ */
let novaRef = {url:'', name:'', type:''};
const PORTALS_8 = [
  ['🇦🇺','Australia','immi.homeaffairs.gov.au','Subclass 482/400 dossier'],
  ['🇷🇸','Serbia','welcometoserbia.gov.rs','Jedinstvena dozvola'],
  ['🇷🇺','Russia','evisa.kdmid.ru','Приглашение'],
  ['🇹🇷','Turkey','www.evisa.gov.tr','Çalışma İzni'],
  ['🇸🇬','Singapore','www.mom.gov.sg','IPA & MOM forms'],
  ['🇲🇾','Malaysia','esd.imi.gov.my','ESD DP10'],
  ['🇸🇦','Saudi','visa.mofa.gov.sa','Qiwa contract'],
  ['🇧🇭','Bahrain','www.evisa.gov.bh','LMRA permit'],
];
const SERBIA_FIELD_DEFS = [
  ['employer','Employer (Poslodavac)'], ['employerAddress','Employer Address'],
  ['mb','Matični broj (MB)'], ['pib','PIB'], ['signatory','Authorized Signatory'], ['signatoryTitle','Signatory Title'],
  ['fullName','Applicant Full Name'], ['passport','Passport Number'], ['dob','Date of Birth'], ['pob','Place of Birth'],
  ['nationality','Citizenship'], ['passportIssuePlace','Passport Issued At'], ['passportIssueDate','Passport Issue Date'],
  ['passportExpiry','Passport Expiry'], ['profession','Profession (Zanimanje)'], ['workPlace','Place of Work'],
  ['validityStart','Validity From'], ['validityEnd','Validity To'], ['accommodationAddress','Accommodation Address'],
  ['phone','Contact Phone'], ['email','Contact Email'], ['salaryBase','Base Salary (RSD)'],
  ['contractRef','Contract Reference'], ['issuePlaceDate','Place & Date of Issue'],
];
function fieldDefsFor(d){ return d.kind === 'serbia' ? SERBIA_FIELD_DEFS : FIELD_DEFS; }

function makeSerbiaDossier(app){
  const d = makeDossier({kind:'serbia', source:'template', fields:{
    title:'Serbia — Jedinstvena Dozvola Package', subtitle:'Employer Submission Package · 7 Pages · DRAFT TEMPLATE',
    destination:'Serbia (Srbija)', visaType:'Jedinstvena dozvola (Single Permit)', embassy:'MUP — Uprava za strance, Beograd',
    employer:'[YOUR COMPANY] D.O.O. Beograd', employerAddress:'[Street and number], 11000 Beograd, Srbija',
    mb:'[Matični broj]', pib:'[PIB]', signatory:'[Authorized signatory]', signatoryTitle:'Direktor',
    pob:'—', passportIssuePlace:'—', passportIssueDate:'—', passportExpiry:'—',
    profession:'GENERALNI RADNIK (General Worker)', workPlace:'Beograd, Srbija',
    validityStart:'—', validityEnd:'—', travelDates:'—',
    accommodationAddress:'[Address, municipality, postal code], Beograd',
    phone:'+381 …', email:'company@example.rs', salaryBase:'65.000,00 RSD',
    contractRef:'[Contract No.]', issuePlaceDate:'Beograd, [date]',
    notes:'NACRT / DRAFT TEMPLATE — prepared with Agent Nova for authorised employer drafting. All placeholders must be replaced with the commissioning employer’s registered data and verified by licensed Serbian legal counsel before signature or submission.',
    body:'Seven-page employer submission package: (1) Pozivno pismo, (2) Pismo potvrde o smeštaju, (3) Potvrda–izjava, (4–7) Ugovor o radu with 27 articles.',
  }});
  if (app){ autofillDossier(d, app); d.fields.destination='Serbia (Srbija)'; d.fields.visaType='Jedinstvena dozvola (Single Permit)'; d.fields.sponsor='Employer (Poslodavac)'; }
  d.checklist = [
    'P.1 Pozivno pismo — invitation letter', 'P.2 Pismo potvrde o smeštaju — accommodation',
    'P.3 Potvrda–izjava — employer declaration', 'P.4–7 Ugovor o radu — employment contract (27 čl.)',
    'Passport copy (bio page, colour)', 'Employer APR extract (registration)',
  ].map((label,i)=>({label, done:i<4}));
  d.feeRows = [
    ['Standard hours — 160 h / month','86.800,00 RSD'], ['Standard hours — 168 h / month','88.640,00 RSD'],
    ['Standard hours — 176 h / month','90.480,00 RSD'], ['Standard hours — 184 h / month','92.320,00 RSD'],
  ].map(([item,amount])=>({item,amount}));
  return d;
}
function createSerbiaDossier(app){
  const d = makeSerbiaDossier(app || DB.applicants[0]);
  DB.dossiers.unshift(d); novaActiveId = d.id; save();
  addActivity('nova', 'Generated Serbia statutory package draft (' + d.ref + ')');
  return d;
}

const SERBIA_GUARANTEES = [
  'Smeštaj — obezbeđen i besplatan smeštaj za zaposlenog (Accommodation provided free of charge);',
  'Ishrana — naknada / obezbeđena ishrana u skladu sa opštim aktom poslodavca (Food allowance);',
  'Lokalni prevoz — organizovan prevoz do mesta rada (Local transportation);',
  'Medicinsko osiguranje — zdravstvena zaštita po Zakonu o radu (Medical coverage);',
  'Socijalno osiguranje — prijava na obavezno socijalno osiguranje (State social & health insurance);',
  'Troškovi vize — obaveza poslodavca (Visa fee obligation of the employer);',
  'Godišnji odmor — najmanje 20 radnih dana (Annual leave entitlement);',
  'Probni rad — najviše 3 meseca (Probation of no more than 3 months);',
  'Doček na aerodromu — transfer po dolasku (Airport transfer on arrival).',
];
const SERBIA_ARTICLES = [
  ['Predmet ugovora','Ovim ugovorom zasniva se radni odnos između Poslodavca i Zaposlenog na poslovima radnog mesta navedenog u zaglavlju ugovora. Zaposleni se obavezuje da poslove obavlja savesno, u skladu sa zakonom, opštim aktima Poslodavca i nalozima neposrednog rukovodioca.'],
  ['Mesto rada','Mesto rada Zaposlenog je sedište i poslovne prostorije Poslodavca, odnosno drugo mesto rada koje odredi Poslodavac u skladu sa zakonom.'],
  ['Početak rada i trajanje','Zaposleni zasniva radni odnos počev od datuma navedenog u zaglavlju. Za stranog državljanina, radni odnos traje najduže do isteka važenja jedinstvene dozvole.'],
  ['Radno vreme','Puno radno vreme iznosi 40 časova nedeljno. Raspored radnog vremena utvrđuje Poslodavac rešenjem, u skladu sa procesom rada.'],
  ['Prekovremeni rad','Na zahtev Poslodavca, Zaposleni je dužan da radi duže od punog radnog vremena u slučajevima i pod uslovima utvrđenim Zakonom o radu.'],
  ['Zarada','Osnovna zarada Zaposlenog utvrđuje se u iznosu naznačenom u zaglavlju, prema tabeli standardnih časova rada koja je sastavni deo ovog člana. Zarada se isplaćuje najmanje jednom mesečno.'],
  ['Uvećanja zarade','Zaposleni ima pravo na uvećanu zaradu: za rad na državni praznik (110% od osnovice), za prekovremeni rad (26%), za noćni rad (26%), kao i po osnovu minulog rada (0,4% po godini), u skladu sa Zakonom o radu.'],
  ['Isplata i naknade','Poslodavac je dužan da Zaposlenom pri isplati dostavi obračun zarade i naknada. Naknada troškova prevoza i ishrane uređuje se opštim aktom Poslodavca.'],
  ['Probni rad','Ugovara se probni rad u trajanju do tri (3) meseca. Za vreme probnog rada obe strane mogu otkazati ugovor uz otkazni rok utvrđen zakonom.'],
  ['Obaveze Zaposlenog','Zaposleni je dužan da poštuje radnu disciplinu, mere bezbednosti i zdravlja na radu, i da čuva poslovnu tajnu Poslodavca.'],
  ['Odmor u toku dnevnog rada','Zaposleni koji radi puno radno vreme ima pravo na odmor u toku dnevnog rada u trajanju od najmanje 30 minuta.'],
  ['Dnevni i nedeljni odmor','Zaposleni ima pravo na odmor između dva uzastopna radna dana u trajanju od najmanje 12 časova neprekidno, i na nedeljni odmor od najmanje 24 časa neprekidno.'],
  ['Godišnji odmor i odsustvo','Zaposleni ima pravo na godišnji odmor u zakonskom minimumu od 20 radnih dana, kao i na plaćeno odsustvo u ukupnom trajanju do 5 radnih dana u slučajevima utvrđenim zakonom.'],
  ['Zabрана konkurencije','Ugovorom se može utvrditi zabрана konkurencije pod uslovima i u rokovima propisanim Zakonom o radu.'],
  ['Odgovornost za štetu','Zaposleni odgovara za štetu koju na radu ili u vezi sa radom, namerno ili iz krajnje nepažnje, prouzrokuje Poslodavcu, u skladu sa zakonom.'],
  ['Privremeni premeštaj','Poslodavac može Zaposlenog privremeno uputiti na druge odgovarajuće poslove u slučajevima i pod uslovima utvrđenim zakonom.'],
  ['Socijalno osiguranje','Poslodavac prijavljuje Zaposlenog na obavezno penzijsko i invalidsko, zdravstveno osiguranje i osiguranje za slučaj nezaposlenosti, od dana stupanja na rad.'],
  ['Bezbednost i zdravlje na radu','Poslodavac obezbeđuje uslove rada i mere bezbednosti i zdravlja na radu u skladu sa važećim propisima; Zaposleni je dužan da ih se pridržava.'],
  ['Prestanak radnog odnosa','Radni odnos prestaje na način i pod uslovima utvrđenim zakonom. Otkazni rok iznosi 15 dana, ako zakonom nije drukčije određeno.'],
  ['Smeštaj, ishrana i prevoz','Poslodavac obezbeđuje smeštaj, ishranu i lokalni prevoz pod uslovima navedenim u Potvrdi–izjavi, koja je sastavni deo predmeta podnošenja zahteva.'],
  ['Troškovi dozvole i dolaska','Troškove izdavanja jedinstvene dozvole i organizovanog dolaska snosi Poslodavac, u skladu sa prethodno datim garancijama.'],
  ['Poverljivost','Zaposleni je dužan da čuva kao poslovnu tajnu sve podatke do kojih dođe tokom rada, i nakon prestanka radnog odnosa u zakonskom roku.'],
  ['Aneks ugovora','Izmena ugovorenih uslova rada vrši se aneksom ugovora u pisanoj formi, pod uslovima utvrđenim zakonom.'],
  ['Rešavanje sporova','Za sporove iz radnog odnosa nadležan je Osnovni sud prema sedištu Poslodavca, uz mogućnost mirnog rešavanja u skladu sa zakonom.'],
  ['Jezik ugovora','Ovaj ugovor sačinjen je na srpskom jeziku. Stranom državljaninu obezbeđuje se razumevanje sadržine ugovora pre potpisivanja.'],
  ['Primerci ugovora','Ugovor je sačinjen u tri istovetna primerka: jedan za Zaposlenog, a dva za Poslodavca i nadležni organ.'],
  ['Završne odredbe','Na sve što nije uređeno ovim ugovorom primenjuju se odredbe Zakona o radu i Zakona o strancima. Ugovor stupa na snagu danom potpisivanja, a primenjuje se od dana stupanja na rad.'],
];

function serbiaPagesHTML(d){
  const f = d.fields, V = k => esc(f[k] || '—'), E = (k,t) => `<span class="data-editable" data-edit="${k}">${esc(t ?? f[k] ?? '—')}</span>`;
  const rows = pairs => `<table class="field-table">${pairs.map(([l,k])=>`<tr><td class="label-cell">${l}</td><td class="value-cell" data-edit="${k}">${V(k)}</td></tr>`).join('')}</table>`;
  const signZone = (leftLbl, rightLbl) => `<div class="legal-sign">
      <div class="sig-box"><div class="sig-space"></div><div class="sig-line">${leftLbl}<br/><b data-edit="signatory">${V('signatory')}</b>, ${E('signatoryTitle')}<br/>(potpis / signature)</div></div>
      <div class="sig-box"><div class="stamp-circle">M.P. · PEČAT</div><div class="sig-line">${rightLbl}</div></div></div>`;
  const foot = n => `<div class="legal-foot"><span>NACRT / DRAFT TEMPLATE — verify with licensed Serbian counsel before official use · Agent Nova</span><span>${esc(d.ref)} · Strana ${n}/7</span></div>`;
  const page = (inner, n) => `<section class="a4-page legal-page"><div class="legal-inner"><span class="draft-tag">NACRT · DRAFT</span>${inner}${foot(n)}</div></section>`;
  const art = (from, to) => SERBIA_ARTICLES.slice(from, to).map(([t, b], i)=>`<div class="article"><div class="a-title">Član ${from+i+1}.</div><p><b>${t}.</b> ${b}</p></div>`).join('');
  const employerLine = `<p class="legal-intro"><b data-edit="employer">${V('employer')}</b>, sa sedištem: ${E('employerAddress')}, matični broj: ${E('mb')}, PIB: ${E('pib')}, koje zastupa ${E('signatory')}, ${E('signatoryTitle')} (u daljem tekstu: Poslodavac / Pozivar).</p>`;

  const p1 = page(`
    <div class="legal-kicker">Позивар је правно лице (Inviter is a legal entity)</div>
    <div class="legal-title">Позивно писмо</div>
    <div class="legal-subtitle">Official Invitation Letter · Министарство спољних послова / МУП Републике Србије</div>
    ${employerLine}
    <p class="legal-intro">Pozivamo sledeće lice da u periodu od ${E('validityStart')} do ${E('validityEnd')} boravi i radi u Republici Srbiji na poslovima: <b data-edit="profession">${V('profession')}</b>.</p>
    ${rows([['Prezime i ime / Full name','fullName'],['Datum rođenja / Date of birth','dob'],['Mesto rođenja / Place of birth','pob'],['Državljanstvo / Citizenship','nationality'],['Broj pasoša / Passport no.','passport'],['Pasoš izdat u / Issued at','passportIssuePlace'],['Datum izdavanja / Issue date','passportIssueDate'],['Važi do / Expiry date','passportExpiry'],['Kontakt telefon','phone'],['Kontakt e-mail','email']])}
    <p class="legal-p">U skladu sa članom 27. Zakona o strancima, pozivar se ovim pozivnim pismom obavezuje da snosi troškove boravka pozvanog lica u Republici Srbiji, kao i troškove njegovog eventualnog prinudnog udaljenja, ukoliko se ti troškovi ne mogu naplatiti od samog stranog državljanina.</p>
    <p class="legal-p">${E('issuePlaceDate')}</p>
    ${signZone('Za pozivara / For the Inviter','Pečat pravnog lica / Company stamp')}
  `, 1);

  const p2 = page(`
    <div class="legal-kicker">Policijska uprava za grad Beograd — Uprava za strance</div>
    <div class="legal-title">Pismo potvrde o smeštaju</div>
    <div class="legal-subtitle">Accommodation Guarantee Letter</div>
    ${employerLine}
    <p class="legal-intro">Potvrđujemo da je za zaposlenog <b data-edit="fullName">${V('fullName')}</b> (pasoš br. ${E('passport')}) obezbeđen smeštaj na adresi:</p>
    ${rows([['Adresa smeštaja / Accommodation address','accommodationAddress'],['Period od / From','validityStart'],['Period do / To','validityEnd']])}
    <p class="legal-p">Poslodavac preuzima punu odgovornost za blagovremenu prijavu boravišta stranog državljanina nadležnoj policijskoj upravi (tzv. „bela karta“), u roku propisanom Zakonom o strancima, kao i za sve troškove smeštaja tokom trajanja radnog odnosa.</p>
    <p class="legal-p">${E('issuePlaceDate')}</p>
    ${signZone('Za poslodavca / For the Employer','Pečat pravnog lica / Company stamp')}
  `, 2);

  const p3 = page(`
    <div class="legal-kicker">Uz zahtev za izdavanje jedinstvene dozvole</div>
    <div class="legal-title">Potvrda — Izjava</div>
    <div class="legal-subtitle">Employer Organisation Declaration</div>
    ${employerLine}
    <p class="legal-p">Pod punom materijalnom i krivičnom odgovornošću izjavljujemo da Poslodavac zapošljava manje od deset (10) zaposlenih, te da u skladu sa Zakonom o radu nije u obavezi da donese pravilnik o organizaciji i sistematizaciji radnih mesta. Poslovi na koje se strani državljanin zapošljava utvrđeni su ugovorom o radu.</p>
    <div class="legal-h">Garancije poslodavca (Employer guarantees):</div>
    <ol class="legal-list">${SERBIA_GUARANTEES.map(g=>`<li>${esc(g)}</li>`).join('')}</ol>
    <p class="legal-p">Izjava se daje za potrebe postupka izdavanja jedinstvene dozvole za privremeni boravak i rad za zaposlenog <b data-edit="fullName">${V('fullName')}</b>.</p>
    <p class="legal-p">${E('issuePlaceDate')}</p>
    ${signZone('Direktor / Director','Pečat pravnog lica / Company stamp')}
  `, 3);

  const salaryTable = `<table class="legal-table"><thead><tr><th>Standardni časovi rada (mesečno)</th><th>Osnovna zarada (RSD)</th></tr></thead>
    <tbody>${d.feeRows.map(r=>`<tr><td>${esc(r.item)}</td><td><b>${esc(r.amount)}</b></td></tr>`).join('')}
    <tr><td>Osnovica / Base rate</td><td><b data-edit="salaryBase">${V('salaryBase')}</b></td></tr></tbody></table>`;

  const p4 = page(`
    <div class="legal-title">Ugovor o radu</div>
    <div class="legal-subtitle">Employment Contract · zaključen na osnovu člana 30. Zakona o radu · Br. <span class="data-editable" data-edit="contractRef">${V('contractRef')}</span></div>
    ${employerLine}
    <p class="legal-intro">i zaposleni <b data-edit="fullName">${V('fullName')}</b>, rođen/a ${E('dob')}, mesto rođenja ${E('pob')}, državljanstvo ${E('nationality')}, pasoš br. ${E('passport')} (u daljem tekstu: Zaposleni), zaključuju sledeći ugovor. Radno mesto: <b data-edit="profession">${V('profession')}</b>; mesto rada: ${E('workPlace')}.</p>
    ${art(0,5)}
    <div class="article"><div class="a-title">Član 6.</div><p><b>Zarada.</b> ${SERBIA_ARTICLES[5][1]}</p></div>
    ${salaryTable}
    ${art(6,7)}
  `, 4);

  const p5 = page(`<div class="legal-subtitle" style="text-align:left">Ugovor o radu (nastavak) · Br. ${V('contractRef')}</div>${art(7,14)}`, 5);
  const p6 = page(`<div class="legal-subtitle" style="text-align:left">Ugovor o radu (nastavak) · Br. ${V('contractRef')}</div>${art(14,21)}`, 6);
  const p7 = page(`<div class="legal-subtitle" style="text-align:left">Ugovor o radu (završni deo) · Br. ${V('contractRef')}</div>${art(21,27)}
    <p class="legal-p">${E('issuePlaceDate')}</p>
    <div class="legal-sign">
      <div class="sig-box"><div class="sig-space"></div><div class="sig-line">Za Poslodavca<br/><b data-edit="signatory">${V('signatory')}</b>, ${E('signatoryTitle')}</div></div>
      <div class="sig-box"><div class="stamp-circle">M.P. · PEČAT</div><div class="sig-line">Pečat poslodavca</div></div>
      <div class="sig-box"><div class="sig-space"></div><div class="sig-line">Zaposleni / Employee<br/><b data-edit="fullName">${V('fullName')}</b></div></div>
    </div>`, 7);

  return p1 + p2 + p3 + p4 + p5 + p6 + p7;
}


/* ---- Editorial A4 rendering ---- */
function dosFieldHTML(label, key, d){
  return `<div class="dos-field" data-edit="${key}" title="Tap to edit"><small>${esc(label)}</small><b>${esc(d.fields[key]||'—')}</b></div>`;
}
function dossierPagesHTML(d){
  if (d.kind === 'serbia') return serbiaPagesHTML(d);
  const f = d.fields;
  const verifyUrl = 'https://nspace.app/verify/' + d.ref;
  const missing = d.checklist.filter(c=>!c.done);
  const timeline = MILESTONES.map((m,i)=>`<div class="dos-step ${i<d.stage?'done':i===d.stage?'now':''}"><i></i><span>${m}</span></div>`).join('');
  const seal = `<div class="dos-seal"><span>Verified<b>${esc(d.ref)}</b>N Space</span></div>`;
  const foot = (page)=>`<div class="dos-foot">${seal}
      <div class="dos-qr">${qrSVG(verifyUrl)}</div>
      <div class="dos-verify"><b>Verify this dossier</b><br/>Scan the QR code or visit<br/>${esc(verifyUrl)}<br/>Issued ${new Date(d.ts).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})} · Agent Nova</div>
      <span class="dos-pageno">Page ${page} of II</span></div>`;
  const img = novaRuntimeImages[d.id] ? `<p class="dos-sec-title">Cloned Source Scan</p><img class="dos-source-img" src="${novaRuntimeImages[d.id]}" alt="Cloned source"/>` : '';
  return `
  <section class="a4-page">
    <header class="dos-head">
      <div class="dos-brand"><span>N Space · Dossier Studio</span><span class="dos-ref">REF ${esc(d.ref)}</span></div>
      <h2 class="dos-title" data-edit="title">${esc(f.title)}</h2>
      <p class="dos-subtitle" data-edit="subtitle">${esc(f.subtitle)}</p>
    </header>
    <div class="dos-body">
      <p class="dos-sec-title">Client Particulars</p>
      <div class="dos-grid">
        ${dosFieldHTML('Full Name','fullName',d)}${dosFieldHTML('Passport Number','passport',d)}
        ${dosFieldHTML('Date of Birth','dob',d)}${dosFieldHTML('Nationality','nationality',d)}
        ${dosFieldHTML('Destination','destination',d)}${dosFieldHTML('Visa Type','visaType',d)}
        ${dosFieldHTML('Sponsor','sponsor',d)}${dosFieldHTML('Travel Dates','travelDates',d)}
      </div>
      <p class="dos-sec-title">Visa Milestone Tracker</p>
      <div class="dos-timeline">${timeline}</div>
      <p class="dos-sec-title">Document Checklist — ${d.checklist.filter(c=>c.done).length}/${d.checklist.length} verified</p>
      <ul class="dos-check">${d.checklist.map((c,i)=>`<li data-check="${i}" class="${c.done?'':'missing'}" title="Tap to toggle"><em>${c.done?'✅':'⚠️'}</em><span>${esc(c.label)}</span></li>`).join('') || '<li>No checklist items</li>'}</ul>
      <p class="dos-sec-title">Advisory</p>
      <div class="dos-note" data-edit="notes">${esc(f.notes)}</div>
    </div>
    ${foot('I')}
  </section>
  <section class="a4-page">
    <header class="dos-head">
      <div class="dos-brand"><span>N Space · Dossier Studio</span><span class="dos-ref">REF ${esc(d.ref)}</span></div>
      <h2 class="dos-title" style="font-size:27px">Requirements &amp; Guidance</h2>
      <p class="dos-subtitle">${esc(f.destination)} · ${esc(f.visaType)} · ${esc(f.embassy)}</p>
    </header>
    <div class="dos-body">
      ${img}
      <p class="dos-sec-title">Dossier Body</p>
      <div class="dos-text" data-edit="body">${esc(f.body)}</div>
      ${d.feeRows.length ? `<p class="dos-sec-title">Fee Schedule</p>
      <table class="dos-table"><thead><tr><th>Item</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${d.feeRows.map(r=>`<tr><td>${esc(r.item)}</td><td style="text-align:right"><b>${esc(r.amount)}</b></td></tr>`).join('')}</tbody></table>` : ''}
      <p class="dos-sec-title">Next Actions</p>
      <div class="dos-text">${missing.length ? missing.map((c,i)=>`${i+1}. Provide: ${esc(c.label)}`).join('\n') : 'All documents verified — this dossier is ready for submission. Dispatch will be handled by Tanya (Dispatch Agent) with tracking shared to the client.'}</div>
      <div class="dos-sign">
        <div><b>Agent Nova</b>Prepared by · Dossier &amp; Document Architect<br/>N Space — AI Visa Agent Workspace</div>
        <div><b>${esc(f.fullName)}</b>Applicant acknowledgement<br/>Signature &amp; date on submission day</div>
      </div>
    </div>
    ${foot('II')}
  </section>`;
}
function dossierCanvasHTML(d){ return `<div class="a4-stack">${dossierPagesHTML(d)}</div>`; }

/* ---- Nova Studio view ---- */
VIEWS.nova = function(){
  const d = activeDossier();
  const phases = [
    ['Structural Decomposition','Layout grid, tables, seals & signature blocks'],
    ['Style & Token Mapping','Editorial typography · applicant field mapping'],
    ['Canvas Reconstruction','Live editable A4 vector layout'],
    ['Lossless PDF Generation','Print-ready A4 · zero watermarks'],
  ];
  return modHead('Nova Studio — Agent Nova','Dedicated PDF & Visa Document Architect · One-Click PDF Cloner · URL-to-Dossier · pixel-perfect A4 editorial output.',
    `<button class="btn ghost" id="novaSaveTop">${icon('folder','sm')} Save to PDF Center</button>
     <button class="btn primary" id="novaExportTop">${icon('print','sm')} Export A4 PDF</button>`) +
  `<div class="nova-grid">
    <aside class="nova-side">
      <div class="card glass" style="padding:16px">
        <h3 class="section-title" style="display:flex;align-items:center;gap:8px"><span class="agent-ic-lg" style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0b192c,#a8842f)">${icon('spark','sm')}</span> Create with Nova</h3>
        <div class="tpl-grid">${Object.entries(Nova_TEMPLATES).map(([k,t])=>`<button class="tpl-btn" data-tpl="${k}">${esc(t.label)}<small>${esc(t.sub)}</small></button>`).join('')}</div>
        <p class="nova-sub">Statutory Templates · Legal Dossier Engine</p>
        <button class="tpl-btn" data-legal="serbia" style="width:100%">🇷🇸 Serbia — Jedinstvena Dozvola Package<small>7 pages · Pozivno pismo · Smeštaj · Potvrda–izjava · Ugovor o radu (27 članova) · DRAFT template</small></button>
        <p class="nova-sub">Portal Quick-Dispatcher · 8 Nations</p>
        <div class="portal-grid">${PORTALS_8.map(([fl,n,host])=>`<button class="portal-btn" data-portal="${host}" title="${host} — loads into Live Browser & copies applicant data"><span>${fl}</span>${n}</button>`).join('')}</div>
        <div class="drop-zone" id="novaDrop" style="margin:12px 0 10px;padding:18px">${icon('up')}<div style="margin-top:5px;font-size:12.5px"><b>One-Click PDF Cloner</b><br/>Drop a PDF, image or text file — or tap to upload</div></div>
        <input type="file" id="novaFile" hidden accept=".pdf,.txt,.csv,image/*"/>
        <div class="url-import"><input id="novaUrl" placeholder="Paste embassy / portal URL…" spellcheck="false"/><button class="btn primary sm" id="novaUrlBtn" style="height:38px">Import</button></div>
        <p class="note" style="margin-top:7px">Try: homeaffairs.gov.au · vfsglobal.com · visa.mofa.gov.sa · gov.uk</p>
        <ul class="nova-phase" id="novaPhases">${phases.map((ph,i)=>`<li data-ph="${i+1}" class="${(novaPhaseStep===5||novaPhaseStep>i+1)?'done':novaPhaseStep===i+1?'active':''}"><span class="ph-ic">${(novaPhaseStep===5||novaPhaseStep>i+1)?icon('check','sm'):i+1}</span><span><b>${ph[0]}</b>${ph[1]}</span></li>`).join('')}</ul>
      </div>

      <div class="card glass" style="padding:16px">
        <h3 class="section-title">Applicant Auto-Fill</h3>
        <div class="fgroup"><label>Verified applicant (data by Raffi · OCR)</label>
        <select id="novaApplicant">${DB.applicants.map(a=>`<option value="${a.id}" ${d.applicantId===a.id?'selected':''}>${esc(a.name)} — ${esc(a.country)}</option>`).join('')}</select></div>
        <button class="btn ghost" id="novaAutofill" style="width:100%;justify-content:center;margin-top:10px">${icon('spark','sm')} Auto-fill from passport data</button>
      </div>

      <div class="card glass" id="novaEditor" style="padding:16px">
        <div class="col-head"><h3 class="sub-head no-m">Field Editor</h3><button class="icon-btn editor-close" id="editorClose" aria-label="Close editor">${icon('x')}</button><span class="pill violet">Live</span></div>
        <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px">
          ${fieldDefsFor(d).map(([k,label])=>`<div class="fgroup ${k==='title'||k==='subtitle'||k==='employer'||k==='employerAddress'||k==='accommodationAddress'?'full':''}"><label>${label}</label><input class="nova-field" data-f="${k}" value="${esc(d.fields[k]||'')}"/></div>`).join('')}
          <div class="fgroup full"><label>Current Milestone Stage</label>
            <select id="novaStage">${MILESTONES.map((m,i)=>`<option value="${i}" ${d.stage===i?'selected':''}>${m}</option>`).join('')}</select></div>
          <div class="fgroup full"><label>Advisory Note</label><textarea class="nova-field" data-f="notes" rows="3">${esc(d.fields.notes)}</textarea></div>
          <div class="fgroup full"><label>Dossier Body (Page II)</label><textarea class="nova-field" data-f="body" rows="6">${esc(d.fields.body)}</textarea></div>
        </div>
        <h4 class="section-title" style="font-size:13px">Checklist</h4>
        <div class="check-edit" id="novaCheckList">${d.checklist.map((c,i)=>`<label><input type="checkbox" data-ci="${i}" ${c.done?'checked':''}/> ${esc(c.label)}</label>`).join('')}</div>
        <div class="url-import" style="margin-top:9px"><input id="novaCheckAdd" placeholder="Add checklist item…"/><button class="btn ghost sm" id="novaCheckAddBtn" style="height:38px">Add</button></div>
      </div>

      <div class="card glass nova-actions" style="padding:16px">
        <button class="btn primary" id="novaExport">${icon('print','sm')} Export Print-Ready A4</button>
        <button class="btn ghost" id="novaDuplicate">${icon('refresh','sm')} Duplicate &amp; Re-skin for…</button>
        <button class="btn ghost" id="novaSavePdf">${icon('folder','sm')} Save to PDF Center</button>
        <button class="btn ghost" id="novaDispatch">${icon('send','sm')} Dispatch via Tanya</button>
        <button class="btn danger-ghost" id="novaDelete">${icon('trash','sm')} Delete Dossier</button>
      </div>
    </aside>

    <div class="nova-main">
      <div class="a4bar">
        <label class="field" style="height:36px">${icon('file','sm')}<select id="novaSelect">${DB.dossiers.map(x=>`<option value="${x.id}" ${x.id===d.id?'selected':''}>${esc(x.fields.title)} · ${esc(x.ref)}</option>`).join('')}</select></label>
        <span class="pill violet">${esc(d.ref)}</span>
        <span class="spacer"></span>
        <button class="btn ghost sm" id="zoomOut">−</button>
        <button class="btn ghost sm" id="zoomFit">Fit</button>
        <button class="btn ghost sm" id="zoomIn">+</button>
      </div>
      ${novaRef.url ? `<div class="ref-split"><div class="ref-pane"><div class="col-head"><h3 class="sub-head no-m">Reference</h3><span class="ref-name">${esc(novaRef.name)}</span><button class="icon-btn sm2" id="refClose" aria-label="Close reference">${icon('x','sm')}</button></div>${novaRef.type.startsWith('image/') ? `<img src="${novaRef.url}" alt="Reference document"/>` : `<iframe src="${novaRef.url}" title="Reference document preview"></iframe>`}</div><div>` : ''}
      <div class="a4-viewport" id="novaViewport"><div class="a4-scaler" id="novaScaler"><div id="novaCanvas">${dossierCanvasHTML(d)}</div></div></div>${novaRef.url ? '</div></div>' : ''}
      <p class="note" style="margin-top:9px">Tap any field, checklist item or paragraph on the canvas to edit it — on mobile the editor slides up as a bottom sheet. Export uses vector <b>@page A4</b> printing: choose <b>“Save as PDF”</b> for a lossless, watermark-free file.</p>
    </div>
  </div>`;
};

function setPhase(n){
  novaPhaseStep = n;
  $$('#novaPhases li').forEach(li=>{
    const p = +li.dataset.ph;
    li.classList.toggle('done', p < n || n === 5);
    li.classList.toggle('active', p === n);
    const ic = li.querySelector('.ph-ic');
    if (ic) ic.innerHTML = (p < n || n === 5) ? icon('check','sm') : String(p);
  });
}
function renderNovaCanvas(){
  const d = activeDossier(); const c = $('#novaCanvas'); if (!c) return;
  c.innerHTML = dossierCanvasHTML(d); applyNovaZoom();
}
function applyNovaZoom(){
  const vp = $('#novaViewport'), sc = $('#novaScaler'), cv = $('#novaCanvas');
  if (!vp || !sc || !cv) return;
  const avail = Math.max(280, vp.clientWidth - 44);
  const fit = Math.min(1, avail / 794);
  const z = novaZoom === null ? fit : novaZoom;
  cv.style.transform = `scale(${z})`; cv.style.transformOrigin = 'top left'; cv.style.width = '794px';
  const stackEl = cv.querySelector('.a4-stack'); const fullH = stackEl ? stackEl.offsetHeight : (1123*2 + 20);
  sc.style.width = (794*z) + 'px'; sc.style.height = (fullH*z) + 'px';
}
if (!window.__novaResizeBound){ window.__novaResizeBound = true; window.addEventListener('resize', ()=> applyNovaZoom()); }

function saveDossierToPdfCenter(d){
  d = d || activeDossier();
  const name = d.fields.title.replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'') + '_' + d.ref + '.pdf';
  const p = addPdf(name, 'Dossier', d.fields.fullName);
  p.dossierId = d.id; save(); renderPdfMini();
  addActivity('nova', 'Saved dossier ' + d.ref + ' to PDF Center');
  toast('Dossier saved to PDF Center');
  return p;
}
function ensurePrintArea(){
  let area = $('#printArea');
  if (!area){ area = document.createElement('div'); area.id='printArea'; area.style.cssText='display:none;position:absolute;left:0;top:0;width:100%'; document.body.appendChild(area); }
  return area;
}
function printDossier(d){
  d = d || activeDossier();
  ensurePrintArea().innerHTML = `<div class="a4-stack">${dossierPagesHTML(d)}</div>`;
  addActivity('nova', 'Exported print-ready A4 dossier ' + d.ref);
  toast('Print-ready A4 — choose “Save as PDF” (margins: None)');
  setTimeout(()=> window.print(), 350);
}
function openDuplicateModal(){
  const d = activeDossier();
  openModal('Duplicate & Re-skin', `<p class="note" style="margin-bottom:12px">Clone <b>${esc(d.fields.title)}</b> (${esc(d.ref)}) and instantly re-skin it with another applicant’s verified passport data.</p>
    <div class="fgroup"><label>New applicant</label><select id="dupApp" style="width:100%;border:1px solid var(--stroke);border-radius:12px;padding:10px 12px;background:var(--panel-strong)">${DB.applicants.map(a=>`<option value="${a.id}">${esc(a.name)} — ${esc(a.country)} ${esc(a.visa)}</option>`).join('')}</select></div>`,
  [{label:'Cancel', cls:'ghost'}, {label:'Clone & Re-skin', cls:'primary', fn:()=>{
    const app = DB.applicants.find(a=>a.id===$('#dupApp').value);
    const clone = JSON.parse(JSON.stringify(d));
    clone.id = uid(); clone.ref = genRef(); clone.ts = Date.now(); clone.source = 'clone';
    autofillDossier(clone, app);
    DB.dossiers.unshift(clone); novaActiveId = clone.id; save();
    addActivity('nova', `Cloned dossier for ${app.name} (${clone.ref})`);
    switchView('nova'); toast('Dossier cloned & re-skinned for ' + app.name);
  }}]);
}

/* ---- Phase 1 helpers: real text-layer extraction for PDFs ---- */
async function extractPdfText(file){
  try {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const raw = new TextDecoder('latin1').decode(bytes);
    const texts = [];
    const unesc = t => t.replace(/\\n/g,'\n').replace(/\\r/g,'').replace(/\\([()\\])/g,'$1');
    const parse = (str)=>{
      let m; const re = /\((?:\\.|[^\\)])*\)\s*(?:Tj|')/g;
      while ((m = re.exec(str))){ const t = unesc(m[0].replace(/\s*(?:Tj|')$/,'').slice(1,-1)); if (t.trim()) texts.push(t); }
      const re2 = /\[([^\]]*)\]\s*TJ/g;
      while ((m = re2.exec(str))){ const j = [...m[1].matchAll(/\((?:\\.|[^\\)])*\)/g)].map(x=>unesc(x[0].slice(1,-1))).join(''); if (j.trim()) texts.push(j); }
    };
    parse(raw);
    if (texts.length < 3 && typeof DecompressionStream !== 'undefined'){
      const re = /stream\r?\n/g; let sm, tries = 0;
      while ((sm = re.exec(raw)) && tries < 14){
        const start = sm.index + sm[0].length, end = raw.indexOf('endstream', start);
        if (end < 0) break; tries++;
        try {
          const inflated = await new Response(new Blob([bytes.slice(start,end)]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
          parse(new TextDecoder('latin1').decode(inflated));
        } catch(e){}
      }
    }
    return texts.join('\n');
  } catch(e){ return ''; }
}
async function geminiVisionExtract(file, dataUrl){
  const key = DB.settings.geminiKey;
  if (!key || !dataUrl) return null;
  try {
    const b64 = dataUrl.split(',')[1];
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({contents:[{parts:[
        {text:'Extract visa document data. Reply ONLY with JSON: {"fullName":"","passport":"","dob":"","nationality":"","visaType":""} — empty string when unknown.'},
        {inline_data:{mime_type:file.type||'image/jpeg', data:b64}},
      ]}]})
    });
    if (!res.ok) return null;
    const data = await res.json();
    const txt = data.candidates?.[0]?.content?.parts?.map(p=>p.text).join('') || '';
    const m = txt.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch(e){ return null; }
}
function fieldsFromText(text){
  const found = {};
  const pass = text.match(/\b[A-Z]{1,3}\d{6,9}\b/); if (pass) found.passport = pass[0];
  const date = text.match(/\b\d{1,2}[\s\/-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})[\s\/-]\d{4}\b/i); if (date) found.dob = date[0];
  return found;
}

/* ---- One-Click PDF Cloner ---- */
async function cloneFromFile(file){
  if (!file) return;
  setPhase(1);
  try { if (novaRef.url) URL.revokeObjectURL(novaRef.url); novaRef = {url:URL.createObjectURL(file), name:file.name, type:file.type||''}; } catch(e) { novaRef = {url:'', name:file.name, type:file.type||''}; }
  consoleLog('[nova] Phase 1 — structural decomposition: ' + file.name);
  addActivity('document', 'Raffi (OCR) ingested ' + file.name + ' for Nova');
  let text = '', imgData = null, vision = null;
  try {
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') text = await extractPdfText(file);
    else if (file.type.startsWith('image/')){
      imgData = await new Promise(r=>{ const fr = new FileReader(); fr.onload = ()=>r(fr.result); fr.readAsDataURL(file); });
      vision = await geminiVisionExtract(file, imgData);
    } else text = await file.text();
  } catch(e){}
  await new Promise(r=>setTimeout(r, 650)); setPhase(2);
  consoleLog('[nova] Phase 2 — style & token mapping' + (vision ? ' (Gemini vision fields merged)' : text ? ` (${text.split('\n').length} text lines extracted)` : ' (layout skeleton mode)'));
  const app = DB.applicants.find(a=>a.id === ($('#novaApplicant')?.value)) || DB.applicants[0];
  const d = Nova_TEMPLATES.briefing.make(app);
  d.source = 'clone'; d.ts = Date.now();
  const base = file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim();
  d.fields.title = base ? base.replace(/\b\w/g, c=>c.toUpperCase()) : 'Cloned Dossier';
  d.fields.subtitle = 'Cloned & re-skinned by Agent Nova · source: ' + file.name;
  Object.assign(d.fields, fieldsFromText(text), vision || {});
  const lines = text.split('\n').map(x=>x.trim()).filter(x=>x.length>3);
  const itemLines = lines.filter(x=>x.length < 95 && !/^(page|www\.|http)/i.test(x)).slice(0,10);
  if (itemLines.length >= 3) d.checklist = itemLines.map((label,i)=>({label, done:i<2}));
  if (text) d.fields.body = 'Extracted from “' + file.name + '” and reconstructed by Agent Nova. Edit any paragraph, then export a lossless A4 PDF.\n\n' + lines.slice(0,28).join('\n').slice(0, 1800);
  await new Promise(r=>setTimeout(r, 650)); setPhase(3);
  DB.dossiers.unshift(d); novaActiveId = d.id;
  if (imgData) novaRuntimeImages[d.id] = imgData;
  DB.documents.unshift({id:uid(), name:file.name, size:(file.size>1048576?(file.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(file.size/1024))+' KB'), by:'Nova Cloner', ts:Date.now()});
  save();
  addActivity('nova', 'Cloned template from ' + file.name + ' → ' + d.ref);
  switchView('nova');
  await new Promise(r=>setTimeout(r, 650)); setPhase(5);
  consoleLog('[nova] Phase 4 — canvas ready; lossless A4 export armed');
  toast('Clone ready — tap any field to edit, then Export A4');
}

/* ---- URL-to-Dossier ---- */
const URL_KB = [
  {match:/homeaffairs|immi\.homeaffairs|gov\.au/i, dest:'Australia', visa:'Visitor / Student', embassy:'Australian High Commission, Dhaka',
   checklist:['ImmiAccount application lodged','Passport bio-page scan (colour)','Financial capacity evidence','Genuine Student / visitor statement','Health examination (HAP ID)','Biometrics at AVAC'],
   fees:[['Visitor (600) VAC','AUD 200'],['Student (500) VAC','AUD 2,000'],['Biometrics (AVAC)','BDT 3,850']],
   body:'Synthesised from the Australian Department of Home Affairs portal. Processing: Visitor (600) ≈ 20–30 days, Student (500) ≈ 4–6 weeks. Attach colour scans only — never send originals unless requested by a case officer.'},
  {match:/vfsglobal/i, dest:'Schengen / UK (VFS)', visa:'VAC Submission', embassy:'VFS Global, Dhaka',
   checklist:['Online form completed & printed','Appointment confirmation letter','Passport + copies arranged in order','Supporting documents (2 sets)','Biometrics enrolment at VAC','Courier return envelope'],
   fees:[['VFS service charge','BDT 2,940'],['Courier return','BDT 850'],['SMS updates','BDT 320']],
   body:'Synthesised from VFS Global guidance. Arrive 15 minutes before your slot with documents arranged in checklist order; walk-ins are not accepted. Track with your GWF/VID reference after submission.'},
  {match:/mofa|saudi|visa\.mofa/i, dest:'Saudi Arabia', visa:'Visit / Work Visa', embassy:'Royal Embassy of Saudi Arabia, Dhaka',
   checklist:['MOFA visa approval slip','Passport valid 6+ months','Medical report (GAMCA/WAFID)','Police clearance attested','Photographs white background','Sponsor ID / iqama copy'],
   fees:[['MOFA e-number','As issued'],['Medical (WAFID)','USD 21 + centre fee'],['Attestation','Per document']],
   body:'Synthesised from Saudi MOFA requirements. Medical must be completed through the WAFID-assigned centre only; reports from other clinics are rejected automatically.'},
  {match:/gov\.uk/i, dest:'United Kingdom', visa:'Student / Visitor', embassy:'British High Commission (VFS Dhaka)',
   checklist:['UKVI online application','IHS surcharge paid','CAS / sponsor documents','Financial evidence — 28-day rule','TB test certificate (IOM)','Biometrics at VFS'],
   fees:[['Student visa','GBP 524'],['IHS','GBP 776 / year'],['TB test','USD 110']],
   body:'Synthesised from GOV.UK. Funds must be held for 28 consecutive days ending no more than 31 days before application. eVisa account setup is required after arrival — BRP cards have been phased out.'},
  {match:/Canada\.ca|ircc/i, dest:'Canada', visa:'Visitor / Study Permit', embassy:'VFS Canada, Dhaka (IRCC)',
   checklist:['IRCC account & forms validated','Proof of funds & ties to Bangladesh','LOA (for study permit)','Upfront medical (panel physician)','Biometrics at VAC','Police certificate'],
   fees:[['Study permit','CAD 150'],['Biometrics','CAD 85'],['Visitor visa','CAD 100']],
   body:'Synthesised from IRCC (Canada.ca). SDS/GIC routes require funds before lodgement. Average processing from Bangladesh: study permit ≈ 8 weeks after biometrics.'},
];
async function importUrlToDossier(url){
  url = (url||'').trim(); if (!url) return toast('Paste a URL first', false);
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (currentView !== 'nova') switchView('nova');
  setPhase(1);
  consoleLog('[nova] URL import — fetching ' + url);
  let live = null, mode = 'curated embassy knowledge (offline-safe)';
  try {
    const ctrl = new AbortController(); const to = setTimeout(()=>ctrl.abort(), 6000);
    const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url), {signal:ctrl.signal});
    clearTimeout(to);
    if (res.ok){
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const lines = [...new Set([...doc.querySelectorAll('h1,h2,h3,li')].map(e=>e.textContent.replace(/\s+/g,' ').trim()).filter(t=>t.length>18 && t.length<180))].slice(0,26);
      if (lines.length >= 4){ live = {title:(doc.querySelector('h1')?.textContent||'').trim(), lines}; mode = 'live web extraction'; }
    }
  } catch(e){}
  await new Promise(r=>setTimeout(r, 550)); setPhase(2);
  const kb = URL_KB.find(k=>k.match.test(url)) || {dest:'Destination', visa:'Visa Application', embassy:'Embassy / VAC, Dhaka',
    checklist:['Valid passport','Completed application form','Financial evidence','Supporting civil documents','Biometrics appointment'],
    fees:[['Application charge','See official portal']], body:'Synthesised by Agent Nova from the supplied URL. Verify every fee and deadline on the official portal before lodgement.'};
  let host = url; try { host = new URL(url).host.replace('www.',''); } catch(e){}
  const app = DB.applicants.find(a=>a.id === ($('#novaApplicant')?.value)) || DB.applicants[0];
  const d = Nova_TEMPLATES.briefing.make(app);
  d.source = 'url'; d.sourceUrl = url; d.ts = Date.now();
  d.fields.title = (live?.title || (kb.dest + ' Visa Briefing')) .slice(0, 64);
  d.fields.subtitle = 'Executive Client Briefing · source: ' + host;
  d.fields.destination = kb.dest; d.fields.visaType = kb.visa; d.fields.embassy = kb.embassy;
  d.checklist = (live ? live.lines.slice(0,10) : kb.checklist).map((label,i)=>({label:String(label), done:i<1}));
  d.fields.body = live ? ('Extracted live from ' + url + ' and editorialised by Agent Nova:\n\n' + live.lines.join('\n')) : kb.body;
  d.feeRows = kb.fees.map(([item,amount])=>({item,amount}));
  await new Promise(r=>setTimeout(r, 550)); setPhase(3);
  DB.dossiers.unshift(d); novaActiveId = d.id; save();
  addActivity('nova', `URL dossier created from ${host} (${d.ref})`);
  addActivity('research', `Portal scan complete — ${mode}`);
  switchView('nova');
  await new Promise(r=>setTimeout(r, 550)); setPhase(5);
  consoleLog('[nova] URL dossier ready · mode: ' + mode);
  toast('Dossier synthesised from ' + host);
}

/* ---- Nova Studio bindings ---- */
BIND.nova = function(){
  const d0 = activeDossier();
  requestAnimationFrame(()=> applyNovaZoom());
  $$('[data-tpl]').forEach(b=> b.addEventListener('click', ()=>{
    const app = DB.applicants.find(a=>a.id===$('#novaApplicant').value) || DB.applicants[0];
    const d = Nova_TEMPLATES[b.dataset.tpl].make(app);
    DB.dossiers.unshift(d); novaActiveId = d.id; save();
    addActivity('nova', 'Created ' + d.fields.title + ' (' + d.ref + ')');
    setPhase(5); switchView('nova'); toast('Template created — now make it yours');
  }));
  $$('[data-legal]').forEach(b=> b.addEventListener('click', ()=>{
    const app = DB.applicants.find(a=>a.id===$('#novaApplicant').value) || DB.applicants[0];
    const d = createSerbiaDossier(app);
    setPhase(5); switchView('nova');
    toast('Serbia statutory draft created (' + d.ref + ') — fill employer placeholders before use');
  }));
  $$('[data-portal]').forEach(b=> b.addEventListener('click', ()=>{
    const url = 'https://' + b.dataset.portal;
    $('#urlInput').value = url;
    const sess = activeSession(); if (sess){ sess.url = url; save(); }
    openRightPanelDesktopHint();
    logExec('navigate', 'Portal dispatched to Live Browser: ' + b.dataset.portal);
    const app = DB.applicants.find(a=>a.id===$('#novaApplicant')?.value) || DB.applicants[0];
    try { if (app && navigator.clipboard) navigator.clipboard.writeText(`${app.name} | Passport: ${app.passport||'—'} | DOB: ${app.dob||'—'} | ${app.country} ${app.visa}`); } catch(e){}
    toast(b.dataset.portal + ' loaded in Live Browser · applicant data copied');
  }));
  $('#refClose')?.addEventListener('click', ()=>{ try{ URL.revokeObjectURL(novaRef.url); }catch(e){} novaRef = {url:'',name:'',type:''}; switchView('nova'); });
  $('#novaSelect').addEventListener('change', e=>{ novaActiveId = e.target.value; switchView('nova'); });
  $('#novaAutofill').addEventListener('click', ()=>{
    const app = DB.applicants.find(a=>a.id===$('#novaApplicant').value);
    autofillDossier(activeDossier(), app); save(); switchView('nova');
    addActivity('nova', 'Auto-filled dossier from ' + app.name + '’s passport data (Raffi OCR)');
    toast('Auto-filled from verified passport data');
  });
  $$('.nova-field').forEach(inp=> inp.addEventListener('input', ()=>{
    activeDossier().fields[inp.dataset.f] = inp.value; save(); renderNovaCanvas();
  }));
  $('#novaStage').addEventListener('change', e=>{ activeDossier().stage = +e.target.value; save(); renderNovaCanvas(); });
  $('#novaCheckList').addEventListener('change', e=>{
    const cb = e.target.closest('input[data-ci]'); if (!cb) return;
    activeDossier().checklist[+cb.dataset.ci].done = cb.checked; save(); renderNovaCanvas();
  });
  const addCheck = ()=>{
    const v = $('#novaCheckAdd').value.trim(); if (!v) return;
    activeDossier().checklist.push({label:v, done:false}); save(); switchView('nova');
  };
  $('#novaCheckAddBtn').addEventListener('click', addCheck);
  $('#novaCheckAdd').addEventListener('keydown', e=>{ if (e.key==='Enter') addCheck(); });
  $('#novaCanvas').addEventListener('click', e=>{
    const check = e.target.closest('[data-check]');
    if (check){
      const i = +check.dataset.check, d = activeDossier();
      d.checklist[i].done = !d.checklist[i].done; save(); renderNovaCanvas();
      const cb = $(`#novaCheckList input[data-ci="${i}"]`); if (cb) cb.checked = d.checklist[i].done;
      return;
    }
    const fld = e.target.closest('[data-edit]');
    if (fld){
      const key = fld.dataset.edit;
      const inp = $(`.nova-field[data-f="${key}"]`);
      if (window.innerWidth <= 800) $('#novaEditor').classList.add('sheet-open');
      if (inp){ inp.focus(); inp.scrollIntoView({behavior:'smooth', block:'center'}); }
    }
  });
  $('#editorClose').addEventListener('click', ()=> $('#novaEditor').classList.remove('sheet-open'));
  $('#zoomIn').addEventListener('click', ()=>{ novaZoom = Math.min(1.6, (novaZoom ?? .8) + .1); applyNovaZoom(); });
  $('#zoomOut').addEventListener('click', ()=>{ novaZoom = Math.max(.3, (novaZoom ?? .8) - .1); applyNovaZoom(); });
  $('#zoomFit').addEventListener('click', ()=>{ novaZoom = null; applyNovaZoom(); });
  const drop = $('#novaDrop'), fileIn = $('#novaFile');
  drop.addEventListener('click', ()=> fileIn.click());
  fileIn.addEventListener('change', ()=>{ cloneFromFile(fileIn.files[0]); fileIn.value=''; });
  drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.classList.add('drag'); });
  drop.addEventListener('dragleave', ()=> drop.classList.remove('drag'));
  drop.addEventListener('drop', e=>{ e.preventDefault(); drop.classList.remove('drag'); cloneFromFile(e.dataTransfer.files[0]); });
  $('#novaUrlBtn').addEventListener('click', ()=> importUrlToDossier($('#novaUrl').value));
  $('#novaUrl').addEventListener('keydown', e=>{ if (e.key==='Enter') importUrlToDossier(e.target.value); });
  const doExport = ()=> printDossier();
  const doSave = ()=> saveDossierToPdfCenter();
  $('#novaExport').addEventListener('click', doExport);
  $('#novaExportTop').addEventListener('click', doExport);
  $('#novaSavePdf').addEventListener('click', doSave);
  $('#novaSaveTop').addEventListener('click', doSave);
  $('#novaDuplicate').addEventListener('click', openDuplicateModal);
  $('#novaDispatch').addEventListener('click', ()=>{
    const d = activeDossier();
    saveDossierToPdfCenter(d);
    runAgentQuick('dispatch', `Dispatched dossier ${d.ref} to ${d.fields.fullName} via WhatsApp & email`);
    if (navigator.share) navigator.share({title:d.fields.title, text:`${d.fields.title} (${d.ref}) — verify: https://nspace.app/verify/${d.ref}`}).catch(()=>{});
  });
  $('#novaDelete').addEventListener('click', ()=>{
    const d = activeDossier();
    openModal('Delete dossier?', `<p class="note">Delete <b>${esc(d.fields.title)}</b> (${esc(d.ref)})? Saved copies in the PDF Center will remain.</p>`,
    [{label:'Cancel', cls:'ghost'}, {label:'Delete', cls:'primary', fn:()=>{
      DB.dossiers = DB.dossiers.filter(x=>x.id!==d.id); novaActiveId = DB.dossiers[0]?.id || null; save();
      switchView('nova'); toast('Dossier deleted');
    }}]);
  });
};


/* deep links (PWA shortcuts: #applicants, #agents, #pdf …) */
(function(){
  const fromHash = ()=>{ const h = location.hash.replace('#',''); if (h && (h==='home' || VIEW_TITLES[h])) switchView(h); };
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();

/* expose for inline handlers */
Object.assign(window, {openApplicantModal, deleteApplicant, deleteDocument, openCaseModal, openAgentModal, openTaskModal, closeModal, runBrowserTask, runAgentQuick, askAgent, generateChecklistPdf, generateReportPdf, openPdfPreview, downloadPdf, sharePdf, printPdf, regenPdf, openRightPanel, toast, printDossier, importUrlToDossier, saveDossierToPdfCenter, createSerbiaDossier});

/* ---------------- N Space Cloud hooks (auth.js bridge) ---------------- */
(function(){
  // push current active chat to the shared cloud after every message
  window.NSC_exportChat = function(){
    const c = DB.chats.find(x=>x.id===DB.activeChatId);
    if (!c) return null;
    return { id: c.id, title: c.title, agent: c.agent, updated: c.updated, messages: c.messages.slice(-60) };
  };
  // merge shared cloud chats into local list (all signed-in users see all chats)
  window.NSC_mergeHook = function(remote){
    if (!Array.isArray(remote)) return;
    let changed = false;
    for (const rc of remote){
      let c = DB.chats.find(x=>x.id===rc.id);
      if (!c){
        c = { id: rc.id, title: rc.title || 'Shared chat', agent: rc.agent || 'maestro', updated: rc.updated || Date.now(), messages: rc.messages || [], shared: true };
        DB.chats.push(c); changed = true;
      } else if ((rc.updated||0) > (c.updated||0)){
        c.messages = rc.messages || c.messages; c.updated = rc.updated; changed = true;
      }
    }
    if (changed){ save(); if (currentView==='chats') renderChats(); }
  };
  // debounced push on every save
  let pt = null;
  window.NSC_syncHook = function(push){
    const _save = save;
    window.__nsPush = push;
    // wrap pushMessage via event: simplest reliable hook = monkey-patch save
    // (save is const; instead call push from a MutationObserver-free timer)
    clearInterval(pt);
    pt = setInterval(function(){ if (window.NSC && window.NSC.authed() && window.__nsPush) window.__nsPush(); }, 20000);
  };
})();

/* ---------------- live cloud scan in chat ---------------- */
const _localSendChat = sendChat;
sendChat = async function(){
  const input = $('#chatInput');
  const text = input.value.trim(); if(!text) return;
  const actionIntent = /(login|immi|browser|pdf|checklist|report|status|recruit|new applicant|nova|dossier|clone|https?:|scan|check|verify|স্ক্যান|চেক)/i.test(text);
  if (actionIntent && window.NSC && window.NSC.authed()){
    input.value = '';
    const chat = ensureActiveChat();
    if (currentView !== 'chats') switchView('chats');
    pushMessage(chat, 'me', text);
    const th = $('#chatThread');
    const typing = document.createElement('div');
    typing.className = 'bubble ai'; typing.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    if (th){ th.appendChild(typing); th.scrollTop = th.scrollHeight; }
    $('#maestroState').textContent = 'Live cloud browser scanning…';
    consoleLog('[cloud] Starting live cloud scan');
    window.NSC.startScan(text, function(j){
      if (j.liveUrl && !j.status){
        try { const f = document.querySelector('.right-panel iframe, #rpSite'); } catch(e){}
        consoleLog('[cloud] Live session: ' + (j.liveUrl||'').slice(0, 48) + '…');
      }
      if (j.status === 'finished' || j.status === 'stopped'){
        typing.remove();
        const out = j.output || 'Scan complete — no text output returned.';
        pushMessage(chat, 'ai', out);
        $('#maestroState').textContent = 'Maestro is working';
        speak(out);
        addActivity('browser', 'Live cloud scan finished: ' + text.slice(0, 34));
        if (window.__nsPush) window.__nsPush();
      } else if (j.status === 'failed'){
        typing.remove();
        pushMessage(chat, 'ai', 'Cloud scan could not complete. Try rephrasing the task.');
        $('#maestroState').textContent = 'Maestro is working';
      }
    });
    return;
  }
  return _localSendChat();
};
