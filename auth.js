/* N Space Cloud — sign in / sign up gate, shared chat sync, live cloud scan bridge. */
(function () {
"use strict";
var API = "https://nspace-cloud.visamotion365.workers.dev";
var SKEY = "nspace:cloudSession", UKEY = "nspace:cloudUsers";
var $ = function (s, r) { return (r || document).querySelector(s); };
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
var ls = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
var session = ls.get(SKEY, null);
window.NSC = { session: session, scan: null, authed: function () { return !!(session || ls.get(SKEY, null)); } };

function toast(t) { var d = document.createElement("div"); d.className = "nsc-toast"; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2800); }
function initials(n) { return ((n || "N").trim().split(/\s+/)[0] || "N")[0].toUpperCase(); }

/* ---------- gate ---------- */
var mode = "in";
function gate(picker) {
  var gm = ls.get(UKEY, []).slice(0, 3);
  var h = '<div class="nsc-gate" id="nscGate"><div class="nsc-card">';
  if (picker) {
    h += '<div class="nsc-brand"><div class="nsc-mark">N</div><div><b>N Space</b><small>AI Visa Agent OS</small></div></div>' +
      '<h2>Choose an account</h2><p class="nsc-sub">to continue to N Space Cloud</p>' +
      gm.map(function (u) { return '<button class="nsc-acct" data-mail="' + esc(u.email) + '"><span class="nsc-av">' + esc(initials(u.name)) + '</span>' + esc(u.email) + '</button>'; }).join("") +
      '<label>Use another account</label><input id="nscMail" type="email" placeholder="you@gmail.com" autocapitalize="off">' +
      '<div class="nsc-err" id="nscErr"></div><button class="nsc-btn" id="nscGo">Continue</button><button class="nsc-btn ghost" id="nscBack">Back</button><div class="nsc-or"><span>or</span></div><button class="nsc-btn google" id="nscGoogle"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.6-5.1 3.6-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.2 1.2-3.3 0-6-2.2-7-5.2l-3.9 3C3.1 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5 14.2c-.3-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5l-4-3C.4 8.3 0 10.1 0 11.7s.4 3.4 1 4.9l4-2.4z"/><path fill="#EA4335" d="M12 4.7c2.3 0 3.9 1 4.8 1.8l3.5-3.4C18 1.2 15.2 0 12 0 7.3 0 3.1 2.7 1 6.7l4 3c1-3 3.7-5 7-5z"/></svg><span>Continue with Google</span></button>';
  } else {
    h += '<div class="nsc-brand"><div class="nsc-mark">N</div><div><b>N Space</b><small>AI Visa Agent OS</small></div></div>' +
      '<h2 id="nscTitle">Welcome back</h2><p class="nsc-sub">Sign in to sync chats across your team and run live cloud browser scans.</p>' +
      '<div class="nsc-tabs"><button data-m="in" class="' + (mode === "in" ? "on" : "") + '">Sign in</button><button data-m="up" class="' + (mode === "up" ? "on" : "") + '">Create account</button></div>' +
      (mode === "up" ? '<label>Full name</label><input id="nscName" placeholder="Your name">' : "") +
      '<label>Email</label><input id="nscMail" type="email" placeholder="you@gmail.com" autocapitalize="off">' +
      '<label>Password</label><input id="nscPass" type="password" placeholder="6+ characters">' +
      '<div class="nsc-err" id="nscErr"></div><button class="nsc-btn" id="nscGo">' + (mode === "up" ? "Create account" : "Sign in") + '</button><div class="nsc-or"><span>or</span></div><button class="nsc-btn google" id="nscGoogle"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.6-5.1 3.6-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.2 1.2-3.3 0-6-2.2-7-5.2l-3.9 3C3.1 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5 14.2c-.3-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5l-4-3C.4 8.3 0 10.1 0 11.7s.4 3.4 1 4.9l4-2.4z"/><path fill="#EA4335" d="M12 4.7c2.3 0 3.9 1 4.8 1.8l3.5-3.4C18 1.2 15.2 0 12 0 7.3 0 3.1 2.7 1 6.7l4 3c1-3 3.7-5 7-5z"/></svg><span>Continue with Google</span></button>' +
      '<button class="nsc-btn ghost" id="nscG">Continue with one-tap agency access</button>';
  }
  return h + "</div></div>";
}
function wire(picker) {
  var err = function (t) { $("#nscErr").textContent = t; };
  var root = $("#nscGate");
  if (!picker) {
    root.querySelectorAll(".nsc-tabs button").forEach(function (b) {
      b.onclick = function () { mode = b.dataset.m; render(); };
    });
  }
  var gg = $("#nscGoogle"); if (gg) gg.onclick = function () { googleOneClick(); };
var go = $("#nscGo");
  go.onclick = function () {
    var name = ($("#nscName") && $("#nscName").value || "").trim();
    var email = ($("#nscMail").value || "").trim().toLowerCase();
    var pass = $("#nscPass").value || "";
    if (picker) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Enter a valid email.");
      return login(email, pass || "666085");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Enter a valid email.");
    if (pass.length < 6) return err("Password needs 6+ characters.");
    go.disabled = true;
    if (mode === "up") {
      fetch(API + "/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: pass, name: name }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.ok && j.pending) { remember({ email: email, name: j.user.name }); showVerify(email, j.verifyUrl); }
          else if (j.ok) { remember({ email: email, name: j.user.name }); setSession({ email: email, name: j.user.name, master: false }); }
          else { go.disabled = false; err(j.error || "Sign up failed."); }
        });
    } else login(email, pass, go, err);
  };
  $("#nscPass").onkeydown = function (e) { if (e.key === "Enter") go.click(); };
  if (picker) {
    root.querySelectorAll("[data-mail]").forEach(function (b) { b.onclick = function () { login(b.dataset.mail, "666085"); }; });
    $("#nscBack").onclick = function () { render(false); };
  } else {
    $("#nscG").onclick = function () { render(true); };
  }
  function login(email, pass, btn, ef) {
    (btn || go).disabled = true;
    fetch(API + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: pass }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ok) { remember({ email: j.user.email, name: j.user.name }); setSession({ email: j.user.email, name: j.user.name, master: j.master }); }
        else if (j.pending) { go.disabled = false; showVerify(em, j.verifyUrl); }
        else { go.disabled = false; err(j.error || "Sign in failed."); }
      });
  }
}
function remember(u) {
  var all = ls.get(UKEY, []).filter(function (x) { return x.email !== u.email; });
  all.unshift(u); ls.set(UKEY, all.slice(0, 5));
}
function showVerify(email, vUrl) {
  var old = $("#nscGate"); if (old) old.remove();
  var d = document.createElement("div"); d.className = "nsc-gate"; d.id = "nscGate";
  d.innerHTML = '<div class="nsc-card"><div class="nsc-brand"><div class="nsc-mark">N</div><div><b>N Space</b><small>AI Visa Agent OS</small></div></div>' +
    '<h2>Verify your email</h2>' +
    '<p class="nsc-sub">One click and your account is live. Tap the button below to verify <b>' + esc(email) + '</b>, then continue.</p>' +
    '<div class="nsc-verify-box"><span class="nsc-vmail">' + esc(email) + '</span><span class="nsc-vpill">1 click to verify</span></div>' +
    '<button class="nsc-btn" id="nscVerify">Verify email now</button>' +
    '<button class="nsc-btn ghost" id="nscCopyLink">Copy verification link</button>' +
    '<div class="nsc-err" id="nscErr"></div>' +
    '<button class="nsc-btn ghost" id="nscDone">I have verified — sign in</button></div>';
  document.body.appendChild(d);
  $("#nscVerify").onclick = function () { window.open(vUrl, "_blank"); $("#nscErr").textContent = "Verification opened in a new tab. Waiting for confirmation…"; pollVerified(email); };
  $("#nscCopyLink").onclick = function () {
    var i = document.createElement("input"); i.value = vUrl; document.body.appendChild(i); i.select();
    try { document.execCommand("copy"); } catch (e) {}
    i.remove(); $("#nscErr").textContent = "Link copied.";
  };
  $("#nscDone").onclick = function () { mode = "in"; render(); };
  $("#nscMail") && $("#nscMail").focus;
}
function pollVerified(email, n) {
  n = n || 0;
  if (n > 40) return;
  setTimeout(function () {
    fetch(API + "/api/auth/verify-status?email=" + encodeURIComponent(email))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ok && j.verified) { setSession({ email: email, name: email.split("@")[0], master: false }); return; }
        if ($("#nscGate")) pollVerified(email, n + 1);
      }).catch(function () { if ($("#nscGate")) pollVerified(email, n + 1); });
  }, 2500);
}
/* ---------- Google one-click sign-in ---------- */
var GOOGLE_CLIENT_ID = ""; // set a Google OAuth Client ID to activate one-click Google

function gisReady(cb) {
  if (window.google && window.google.accounts && window.google.accounts.id) return cb();
  var s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
  s.onload = function () { cb(); };
  document.body.appendChild(s);
}

function googleOneClick() {
  var e = $("#nscErr"); if (e) e.textContent = "Connecting to Google…";
  if (!GOOGLE_CLIENT_ID) { if (e) e.textContent = "Google one-click needs the Client ID from Google Cloud Console. Ask the admin to add it."; return; }
  gisReady(function () {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: function (resp) {
        if (!resp || !resp.credential) { if (e) e.textContent = "Google sign-in cancelled."; return; }
        fetch(API + "/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential: resp.credential }) })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j.ok) { remember({ email: j.user.email, name: j.user.name }); setSession({ email: j.user.email, name: j.user.name, master: j.master }); }
            else { if (e) e.textContent = j.error || "Google sign-in failed."; }
          });
      }
    });
    window.google.accounts.id.prompt();
  });
}

function render(picker) {
  var old = $("#nscGate"); if (old) old.remove();
  var d = document.createElement("div"); d.innerHTML = gate(picker);
  document.body.appendChild(d.firstChild);
  wire(picker);
}
function setSession(u) {
  session = u; ls.set(SKEY, u);
  window.NSC.session = u;
  var g = $("#nscGate"); if (g) g.remove();
  mountChip();
  startSync();
  toast("Welcome, " + u.name.split(" ")[0]);
}
function mountChip() {
  var old = $("#nscChip"); if (old) old.remove();
  if (!session) return;
  var c = document.createElement("button");
  c.id = "nscChip"; c.className = "nsc-chip";
  c.innerHTML = '<span class="nsc-av">' + esc(initials(session.name)) + '</span><span>' + esc(session.name.split(" ")[0]) + (session.master ? ' <em class="nsc-dot"></em>' : "") + "</span>";
  c.onclick = function () {
    if (confirm("Sign out of N Space Cloud?")) { session = null; localStorage.removeItem(SKEY); window.NSC.session = null; c.remove(); render(); }
  };
  document.body.appendChild(c);
}

/* ---------- shared chat sync ---------- */
var syncT = null;
function chatsKey() { return null; } // app.js owns DB; we mirror via window hook
function startSync() {
  pull();
  if (window.NSC_syncHook) window.NSC_syncHook(push);
  clearInterval(syncT); syncT = setInterval(pull, 45000);
}
function pull() {
  fetch(API + "/api/chats").then(function (r) { return r.json(); }).then(function (j) {
    if (j.ok && window.NSC_mergeHook) window.NSC_mergeHook(j.chats);
  }).catch(function () {});
}
function push() {
  if (!session || !window.NSC_exportChat) return;
  var chat = window.NSC_exportChat();
  if (!chat) return;
  fetch(API + "/api/chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat: chat }) }).catch(function () {});
}

/* ---------- live cloud scan ---------- */
function startScan(task, cb) {
  if (!session) { toast("Sign in to run a live cloud scan."); render(); return; }
  fetch(API + "/api/scan/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: task }) })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.ok) { toast("Cloud browser unavailable — try again."); return; }
      window.NSC.scan = { taskId: j.taskId, sessionId: j.sessionId, liveUrl: j.liveUrl, task: task };
      if (cb) cb(j);
      pollScan(j.taskId, j.sessionId, cb);
    }).catch(function () { toast("Network problem starting scan."); });
}
function pollScan(taskId, sessionId, cb) {
  setTimeout(function () {
    fetch(API + "/api/scan/status?taskId=" + encodeURIComponent(taskId) + "&sessionId=" + encodeURIComponent(sessionId))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) return pollScan(taskId, sessionId, cb);
        if (cb) cb(j);
        if (["finished", "failed", "stopped"].indexOf(j.status) < 0) pollScan(taskId, sessionId, cb);
      }).catch(function () { pollScan(taskId, sessionId, cb); });
  }, 3000);
}
window.NSC.startScan = startScan;
window.NSC.api = API;

/* boot */
if (session) { mountChip(); startSync(); }
else if (location.protocol.indexOf("http") === 0) render();
})();
