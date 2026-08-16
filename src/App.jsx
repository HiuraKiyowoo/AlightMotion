import { useState } from "react";

const SEND_URL   = "/api/send";
const VERIFY_URL = "/api/verify";

function extractLink(raw) {
  const match = raw.match(/ActionWinOpenPassBase64\(['"]([A-Za-z0-9+/=]+)['"]\)/);
  if (match) return atob(match[1]);
  return raw;
}

export default function App() {
  const [tab, setTab]           = useState("send");
  const [email, setEmail]       = useState("");
  const [link, setLink]         = useState("");
  const [verifEmail, setVEmail] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res  = await fetch(SEND_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setResult({ ok: data.status, msg: data.message });
    } catch (e) {
      setResult({ ok: false, msg: e.message });
    }
    setLoading(false);
  }

  async function handleVerif() {
    if (!link.trim()) return;
    setLoading(true); setResult(null);
    try {
      const decoded = extractLink(link.trim());
      const res  = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), link: decoded }),
      });
      const data = await res.json();
      setResult({ ok: data.status, msg: data.message });
    } catch (e) {
      setResult({ ok: false, msg: e.message });
    }
    setLoading(false);
  }

  function switchTab(t) { setTab(t); setResult(null); }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0C0E; }
        input, textarea, button { font-family: inherit; }
        input:focus, textarea:focus {
          outline: none;
          border-color: #7C3AED !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }
        .btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tab:hover { color: #A78BFA; }
        textarea { resize: vertical; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .card { border-radius: 12px; }
          .inner { padding: 20px !important; }
          .head  { padding: 24px 20px 20px !important; }
        }
      `}</style>

      <div style={S.root}>
        <div style={S.aurora} />

        <div className="card" style={S.card}>

          <div className="head" style={S.head}>
            <div style={S.logo}>AM</div>
            <h1 style={S.title}>Aktivasi ALight Motion</h1>
            <p style={S.sub}>Masuk ke akun Alight Creative kamu</p>
          </div>

          <div style={S.tabs}>
            {["send", "verif"].map((t, i) => (
              <button
                key={t}
                className="tab"
                style={{ ...S.tab, ...(tab === t ? S.tabOn : {}) }}
                onClick={() => switchTab(t)}
              >
                <span style={S.tabNum}>{i + 1}</span>
                {t === "send" ? "Kirim Kode" : "Verifikasi"}
              </button>
            ))}
          </div>

          <div className="inner" style={S.inner}>

            {tab === "send" ? (
              <div style={S.fields}>
                <Field label="Alamat Email">
                  <input
                    style={S.input}
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                  />
                </Field>
                <button className="btn" style={S.btn} onClick={handleSend}
                  disabled={loading || !email.trim()}>
                  {loading ? <Spinner /> : "Kirim Kode Aktivasi →"}
                </button>
                <p style={S.hint}>Cek inbox atau folder spam setelah mengirim.</p>
              </div>
            ) : (
              <div style={S.fields}>
                {email && (
                  <div style={S.emailTag}>
                    <span style={S.emailDot} />
                    {email}
                  </div>
                )}
                <Field label="Link Verifikasi dari Email">
                  <textarea
                    style={{ ...S.input, height: 110, lineHeight: 1.55, paddingTop: 10 }}
                    placeholder={"Paste link atau javascript:parent.ActionWin... di sini"}
                    value={link}
                    onChange={e => setLink(e.target.value)}
                  />
                </Field>
                <button className="btn" style={S.btn} onClick={handleVerif}
                  disabled={loading || !link.trim()}>
                  {loading ? <Spinner /> : "Verifikasi Sekarang →"}
                </button>
                {!email && (
                  <p style={{ ...S.hint, color: "#7C3AED" }}>
                    ⚠ Kirim kode di tab 1 dulu agar email terisi otomatis.
                  </p>
                )}
              </div>
            )}

            {result && (
              <div style={{ ...S.result, ...(result.ok ? S.ok : S.err) }}>
                <span style={{ ...S.badge, color: result.ok ? "#34D399" : "#F87171" }}>
                  {result.ok ? "✓ Berhasil" : "✗ Gagal"}
                </span>
                <p style={S.resultMsg}>{result.msg}</p>
              </div>
            )}
          </div>

          <div style={S.foot}>
            <span style={S.footTxt}>Hiura</span>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 16, height: 16,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

const S = {
  root: {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0C0C0E",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  aurora: {
    position: "absolute", top: -160, left: "50%",
    transform: "translateX(-50%)",
    width: 560, height: 440,
    background: "radial-gradient(ellipse at center, rgba(109,40,217,0.20) 0%, transparent 68%)",
    pointerEvents: "none",
    filter: "blur(2px)",
  },
  card: {
    background: "#111113",
    border: "1px solid #222226",
    borderRadius: 16,
    width: "100%", maxWidth: 420,
    position: "relative", zIndex: 1,
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  head: {
    padding: "32px 32px 24px",
    textAlign: "center",
    borderBottom: "1px solid #1C1C20",
  },
  logo: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 52, height: 52,
    background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
    borderRadius: 13,
    color: "#fff", fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px",
    marginBottom: 16,
    boxShadow: "0 6px 24px rgba(109,40,217,0.45)",
  },
  title: {
    fontSize: 19, fontWeight: 700, color: "#F1F1F3",
    letterSpacing: "-0.3px", marginBottom: 6,
  },
  sub: { fontSize: 13, color: "#5A5A66" },
  tabs: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid #1C1C20",
  },
  tab: {
    background: "transparent", border: "none",
    borderBottom: "2px solid transparent",
    color: "#4A4A57",
    fontSize: 13, fontWeight: 600,
    padding: "13px 12px",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s, background 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
  },
  tabOn: {
    color: "#A78BFA",
    borderBottomColor: "#7C3AED",
    background: "rgba(109,40,217,0.05)",
  },
  tabNum: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 18, height: 18,
    background: "rgba(124,58,237,0.2)",
    borderRadius: "50%",
    fontSize: 10, fontWeight: 800, color: "#A78BFA",
  },
  inner: {
    padding: "24px 32px 28px",
    display: "flex", flexDirection: "column", gap: 0,
  },
  fields: { display: "flex", flexDirection: "column", gap: 14 },
  label: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.6px",
    textTransform: "uppercase", color: "#52525E",
  },
  input: {
    background: "#0C0C0E",
    border: "1px solid #222226",
    borderRadius: 8,
    color: "#E8E8ED",
    fontSize: 14,
    padding: "11px 13px",
    width: "100%",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  btn: {
    marginTop: 4,
    background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
    border: "none", borderRadius: 8,
    color: "#fff", fontSize: 14, fontWeight: 700,
    padding: "13px 20px",
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.1s",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 16px rgba(109,40,217,0.3)",
    letterSpacing: "0.1px",
  },
  hint: { fontSize: 12, color: "#3E3E4A", textAlign: "center", lineHeight: 1.6 },
  result: {
    marginTop: 20, borderRadius: 8,
    padding: "13px 16px", border: "1px solid",
  },
  ok: { background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.22)" },
  err: { background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.22)" },
  badge: {
    display: "block",
    fontSize: 11, fontWeight: 800,
    letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: 5,
  },
  resultMsg: { fontSize: 13, color: "#8A8A99", lineHeight: 1.6 },
  emailTag: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(109,40,217,0.08)",
    border: "1px solid rgba(109,40,217,0.2)",
    borderRadius: 6, padding: "8px 12px",
    fontSize: 13, color: "#A78BFA", fontWeight: 500,
  },
  emailDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#7C3AED", flexShrink: 0,
  },
  foot: { borderTop: "1px solid #1A1A1E", padding: "12px 32px", textAlign: "center" },
  footTxt: { fontSize: 11, color: "#2E2E38", letterSpacing: "0.3px" },
};
