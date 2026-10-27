/* N Space Cloud — auth, shared chats, live browser scan (Browser Use). */
const KV = {
  async get(env, k) { return (await env.NSPACE_KV.get(k, "json")) ?? null; },
  async put(env, k, v) { await env.NSPACE_KV.put(k, JSON.stringify(v)); },
};
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS } });

async function sha(t) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("nspace::" + t));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const MASTER_PASS = "666085"; // agency master password -> full live-cloud access

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);

    try {
      /* ---------------- health ---------------- */
      if (url.pathname === "/api/health") return J({ ok: true, service: "nspace-cloud", liveScan: !!env.BROWSER_USE_API_KEY });

      /* ---------------- AUTH ---------------- */
      if (url.pathname === "/api/auth/signup" && request.method === "POST") {
        const { email, password, name } = await request.json().catch(() => ({}));
        const em = String(email || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return J({ error: "Enter a valid email." }, 400);
        if (!password || String(password).length < 6) return J({ error: "Password needs 6+ characters." }, 400);
        if (await KV.get(env, "u:" + em)) return J({ error: "This email already has an account." }, 409);
        const tok = crypto.randomUUID().replace(/-/g, "");
        const user = { email: em, name: (name || em.split("@")[0]).trim(), hash: await sha(String(password)), at: Date.now(), pending: true, vtok: tok };
        await KV.put(env, "u:" + em, user);
        await KV.put(env, "v:" + tok, { email: em });
        const base = (url.origin || "").replace(/\/$/, "");
        return J({ ok: true, user: { email: em, name: user.name }, master: false, pending: true, verifyUrl: base + "/api/auth/verify?token=" + tok });
      }

      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        const { email, password } = await request.json().catch(() => ({}));
        const em = String(email || "").trim().toLowerCase();
        const pw = String(password || "");
        if (pw === MASTER_PASS) {
          const u = (await KV.get(env, "u:" + em)) || { email: em || "agency@nspace.app", name: "Nasim Ahmed", master: true, at: Date.now() };
          u.master = true;
          await KV.put(env, "u:" + u.email, u);
          return J({ ok: true, user: { email: u.email, name: u.name }, master: true });
        }
        const u = await KV.get(env, "u:" + em);
        if (!u || u.hash !== (await sha(pw))) return J({ error: "Incorrect email or password." }, 401);
        if (u.pending) return J({ error: "Email not verified yet — open the verification link first.", pending: true, verifyUrl: (url.origin || "") + "/api/auth/verify?token=" + u.vtok }, 403);
        return J({ ok: true, user: { email: u.email, name: u.name }, master: false });
      }

      /* ---------------- GOOGLE ONE-CLICK ---------------- */
      if (url.pathname === "/api/auth/google") {
        const body2 = await request.json().catch(() => ({}));
        const cred = String(body2.credential || "");
        if (!cred) return J({ error: "Missing Google credential." }, 400);
        const info = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(cred)).then(r => r.json()).catch(() => null);
        if (!info || !info.email) return J({ error: "Google token could not be verified." }, 401);
        if (info.email_verified !== "true" && info.email_verified !== true) return J({ error: "Google email not verified." }, 403);
        const em = info.email.toLowerCase();
        let u = await KV.get(env, "u:" + em);
        if (!u) {
          u = { email: em, name: info.name || em.split("@")[0], hash: null, at: Date.now(), via: "google" };
          await KV.put(env, "u:" + em, u);
        }
        u.pending = false;
        await KV.put(env, "u:" + em, u);
        return J({ ok: true, user: { email: em, name: u.name }, master: false, via: "google" });
      }

      /* ---------------- EMAIL VERIFICATION ---------------- */
      if (url.pathname === "/api/auth/verify") {
        const tok = url.searchParams.get("token") || "";
        const rec = await KV.get(env, "v:" + tok);
        const fail = (t) => new Response("<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>N Space</title><body style='margin:0;font-family:-apple-system,system-ui,sans-serif;background:#f6f8fd;display:grid;place-items:center;min-height:100vh'><div style='text-align:center;padding:28px'><div style='font-size:44px'>" + t + "</div><h2 style=color:#0f172a>" + (t === "\u2705" ? "Email verified" : "Verification failed") + "</h2><p style='color:#5c6470'>" + (t === "\u2705" ? "Your N Space account is active. Return to the app and sign in." : "This verification link is invalid or already used.") + "</p><a href='https://n-space-v2.pages.dev' style='display:inline-block;margin-top:14px;background:linear-gradient(135deg,#4f46e5,#8b5cf6);color:#fff;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:600'>Open N Space</a></div></body>", { status: t === "\u2705" ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
        if (!rec) return fail("\u26a0\ufe0f");
        const u = await KV.get(env, "u:" + rec.email);
        if (!u) return fail("\u26a0\ufe0f");
        u.pending = false; delete u.vtok;
        await KV.put(env, "u:" + rec.email, u);
        await env.NSPACE_KV.delete("v:" + tok);
        return fail("\u2705");
      }
      if (url.pathname === "/api/auth/verify-status") {
        const em = (url.searchParams.get("email") || "").toLowerCase();
        const u = await KV.get(env, "u:" + em);
        if (!u) return J({ error: "no user" }, 404);
        return J({ ok: true, verified: !u.pending });
      }

      /* ---------------- SHARED CHATS ---------------- */
      if (url.pathname === "/api/chats" && request.method === "GET") {
        const all = await KV.get(env, "chats:shared") || [];
        return J({ ok: true, chats: all.slice(0, 200) });
      }
      if (url.pathname === "/api/chats" && request.method === "POST") {
        const { chat } = await request.json().catch(() => ({}));
        if (!chat || !chat.id) return J({ error: "chat required" }, 400);
        const all = (await KV.get(env, "chats:shared")) || [];
        const i = all.findIndex((c) => c.id === chat.id);
        const rec = { ...chat, syncedAt: Date.now() };
        if (i >= 0) all[i] = rec; else all.unshift(rec);
        await KV.put(env, "chats:shared", all.slice(0, 200));
        return J({ ok: true });
      }

      /* ---------------- LIVE CLOUD SCAN (Browser Use) ---------------- */
      const bkeys = () => [env.BROWSER_USE_API_KEY, env.BROWSER_USE_API_KEY_2, env.BROWSER_USE_API_KEY_3].filter(Boolean);
      const bu = async (method, path, body) => {
        let last = null;
        for (const k of bkeys()) {
          const r = await fetch("https://api.browser-use.com/api/v2" + path, {
            method,
            headers: { "X-Browser-Use-API-Key": k, "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
          }).catch(() => null);
          if (!r) continue;
          const d = await r.json().catch(() => ({}));
          if (r.ok) return { ok: true, data: d };
          last = d;
        }
        return { ok: false, data: last || { error: "No Browser Use key configured." } };
      };

      if (url.pathname === "/api/scan/start" && request.method === "POST") {
        const { task } = await request.json().catch(() => ({}));
        const t = String(task || "").trim().slice(0, 2000);
        if (!t) return J({ error: "task required" }, 400);
        const s = await bu("POST", "/sessions", {});
        if (!s.ok) return J({ error: "Could not start cloud browser.", detail: s.data }, 502);
        const tk = await bu("POST", "/tasks", { task: t, sessionId: s.data.id });
        if (!tk.ok) return J({ error: "Could not start scan task.", detail: tk.data }, 502);
        return J({ ok: true, taskId: tk.data.id, sessionId: s.data.id, liveUrl: s.data.liveUrl });
      }
      if (url.pathname === "/api/scan/status" && request.method === "GET") {
        const id = url.searchParams.get("taskId") || "", sid = url.searchParams.get("sessionId") || "";
        if (!id) return J({ error: "taskId required" }, 400);
        const t = await bu("GET", "/tasks/" + encodeURIComponent(id));
        if (!t.ok) return J({ error: "status failed" }, 502);
        let liveUrl = null;
        if (sid) { const s = await bu("GET", "/sessions/" + encodeURIComponent(sid)); if (s.ok) liveUrl = s.data.liveUrl || null; }
        return J({
          ok: true, status: t.data.status, output: t.data.output || null,
          steps: (t.data.steps || []).map((x) => ({ n: x.number, goal: x.nextGoal || x.evaluationPreviousGoal || "", url: x.url || "" })),
          liveUrl,
        });
      }
      if (url.pathname === "/api/scan/stop" && request.method === "POST") {
        const { taskId, sessionId } = await request.json().catch(() => ({}));
        if (taskId) await bu("PATCH", "/tasks/" + encodeURIComponent(taskId), { action: "stop" });
        if (sessionId) await bu("PATCH", "/sessions/" + encodeURIComponent(sessionId), { action: "stop" });
        return J({ ok: true });
      }
    } catch (e) {
      return J({ error: "Server error: " + String(e && e.message || e).slice(0, 120) }, 500);
    }
    return J({ error: "Not found" }, 404);
  },
};
