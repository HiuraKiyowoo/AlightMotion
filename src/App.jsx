import { useState } from "react";

const SEND_URL   = "/api/send";
const VERIFY_URL = "/api/verify";

function extractLink(raw) {
  const match = raw.match(/ActionWinOpenPassBase64\(['"]([A-Za-z0-9+/=]+)['"]\)/);
  if (match) return atob(match[1]);
  return raw;
}

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export default function App() {
  const [email, setEmail]   = useState("");
  const [link, setLink]     = useState("");
  const [sending, setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendResult, setSendResult]   = useState(null);
  const [verifResult, setVerifResult] = useState(null);
  const [sent, setSent] = useState(false);

  async function safePost(url, payload) {
    const res  = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // API returned non-JSON (HTML error page, plain text, etc.)
      return { status: false, message: text.slice(0, 200) || `HTTP ${res.status}` };
    }
  }

  async function handleSend() {
    if (!email.trim()) return;
    setSending(true); setSendResult(null);
    try {
      const data = await safePost(SEND_URL, { email: email.trim() });
      setSendResult({ ok: data.status, msg: data.message });
      if (data.status) setSent(true);
    } catch (e) {
      setSendResult({ ok: false, msg: e.message });
    }
    setSending(false);
  }

  async function handleVerif() {
    if (!link.trim()) return;
    setVerifying(true); setVerifResult(null);
    try {
      const decoded = extractLink(link.trim());
      const data = await safePost(VERIFY_URL, { email: email.trim(), link: decoded });
      setVerifResult({ ok: data.status, msg: data.message });
    } catch (e) {
      setVerifResult({ ok: false, msg: e.message });
    }
    setVerifying(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --bg: #0E0D12;
          --panel: #141318;
          --line: #222030;
          --mint: #5DFFB8;
          --red: #FF5252;
          --ink: #E8E6F0;
          --dim: #7A7890;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        @keyframes scan {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .kf-row {
          display: flex; gap: 14px; padding: 10px 24px;
          border-bottom: 1px solid var(--line);
          overflow: hidden;
          background: repeating-linear-gradient(90deg, #181620 0 2px, transparent 2px 20px);
        }
        .kf-row span {
          width: 8px; height: 8px;
          background: #2E2B40;
          transform: rotate(45deg);
          flex: none;
        }
        .kf-row span.lit { background: var(--mint); box-shadow: 0 0 8px var(--mint); }

        .slot {
          display: flex; gap: 0;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 6px;
          align-items: flex-start;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }
        .slot-icon {
          color: var(--mint); font-size: 13px;
          padding: 13px 12px 0; flex: none;
          font-family: 'JetBrains Mono', monospace;
        }
        .slot input, .slot textarea {
          flex: 1; background: transparent; border: 0; outline: 0;
          color: var(--ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; padding: 12px 6px;
          resize: none;
        }
        .slot input::placeholder, .slot textarea::placeholder { color: #3D3B52; }
        .slot textarea { height: 88px; line-height: 1.5; font-size: 13px; padding-top: 13px; }

        .slot-btn {
          background: var(--mint); color: #081810;
          border: 0; border-radius: 7px;
          padding: 12px 18px;
          font-weight: 700; font-size: 13px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.3px;
          transition: transform .1s, background .1s;
          flex: none; align-self: flex-end; margin-bottom: 0;
        }
        .slot-btn:hover:not(:disabled) { background: #7AFFD0; transform: translateY(-1px); }
        .slot-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .slot-btn.danger { background: var(--red); color: #fff; }
        .slot-btn.danger:hover:not(:disabled) { background: #ff7070; }

        .scanline {
          height: 2px; width: 100%;
          background: linear-gradient(90deg, transparent, var(--mint), transparent);
          background-size: 200% 100%;
          animation: scan 1.2s linear infinite;
          margin-top: 12px; border-radius: 2px;
        }

        .status-msg {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; margin-top: 10px;
          padding: 10px 14px;
          border-radius: 7px;
          border: 1px solid var(--line);
        }
        .status-msg.ok  { border-color: rgba(93,255,184,0.25); color: var(--mint); background: rgba(93,255,184,0.05); }
        .status-msg.err { border-color: rgba(255,82,82,0.25);  color: var(--red);  background: rgba(255,82,82,0.05); }

        .step-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 2px;
          color: var(--dim); text-transform: uppercase;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 10px;
        }
        .step-label::after {
          content: ''; flex: 1; height: 1px; background: var(--line);
        }

        .guide-step {
          display: flex; gap: 16px; align-items: flex-start;
          padding: 16px 0; border-bottom: 1px solid var(--line);
        }
        .guide-step:last-child { border-bottom: 0; }
        .guide-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--mint);
          background: rgba(93,255,184,0.08);
          border: 1px solid rgba(93,255,184,0.2);
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 5px; flex: none; font-weight: 700;
        }
        .guide-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .guide-desc  { font-size: 13px; color: var(--dim); line-height: 1.55; font-family: 'JetBrains Mono', monospace; }

        .email-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: var(--mint);
          background: rgba(93,255,184,0.06);
          border: 1px solid rgba(93,255,184,0.18);
          border-radius: 6px; padding: 6px 12px;
          margin-bottom: 12px;
        }
        .email-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--mint);
          animation: pulse 1.5s ease-in-out infinite;
        }

        a { color: var(--mint); text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Keyframe row */}
      <div className="kf-row" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={[2,7,13,19].includes(i) ? "lit" : ""} />
        ))}
      </div>

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoDot} />
          AMACTIVATOR
        </div>
        <nav style={{ display: "flex", gap: 24 }}>
          <a href="#aktifkan" style={S.navLink}>Aktifkan</a>
          <a href="#cara-pakai" style={S.navLink}>Cara Pakai</a>
        </nav>
      </header>

      <main style={S.main}>

        {/* Hero */}
        <section style={S.hero} id="aktifkan">
          <div style={S.eyebrow}>ZNN // alight creative activation</div>
          <h1 style={S.h1}>
            Masukkan email.<br />
            Aktifkan <span style={{ color: "var(--mint)" }}>akunnya.</span>
          </h1>
          <p style={S.sub}>
            Kirim kode aktivasi ke email, lalu paste link verifikasi dari inbox kamu.
            Proses selesai dalam hitungan detik.
          </p>
        </section>

        {/* Step 1 */}
        <section style={{ marginBottom: 28 }}>
          <div className="step-label">Langkah 01 — Kirim Kode</div>
          <div className="slot">
            <div className="slot-icon">▶</div>
            <input
              type="email"
              placeholder="alamat email kamu..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <button className="slot-btn" onClick={handleSend}
              disabled={sending || !email.trim()}>
              {sending ? "Mengirim…" : "Kirim"}
            </button>
          </div>
          <div style={S.hint}>Cek folder inbox dan spam setelah klik Kirim.</div>
          {sending && <div className="scanline" />}
          {sendResult && (
            <div className={`status-msg ${sendResult.ok ? "ok" : "err"}`}>
              {sendResult.ok ? "✓ " : "✗ "}{sendResult.msg}
            </div>
          )}
        </section>

        {/* Step 2 */}
        <section style={{ marginBottom: 48 }}>
          <div className="step-label">Langkah 02 — Verifikasi Link</div>
          {email && sent && (
            <div className="email-tag">
              <div className="email-dot" />
              {email}
            </div>
          )}
          <div className="slot">
            <div className="slot-icon">▶</div>
            <textarea
              placeholder={"Paste link verifikasi dari email di sini...\n(bisa format javascript:parent.ActionWin... atau URL biasa)"}
              value={link}
              onChange={e => setLink(e.target.value)}
            />
            <button className="slot-btn" onClick={handleVerif}
              style={{ alignSelf: "flex-end", marginBottom: 0 }}
              disabled={verifying || !link.trim()}>
              {verifying ? "Proses…" : "Verif"}
            </button>
          </div>
          {!sent && (
            <div style={{ ...S.hint, color: "rgba(255,82,82,0.7)", marginTop: 8 }}>
              ! Selesaikan langkah 01 terlebih dahulu.
            </div>
          )}
          {verifying && <div className="scanline" />}
          {verifResult && (
            <div className={`status-msg ${verifResult.ok ? "ok" : "err"}`}>
              {verifResult.ok ? "✓ " : "✗ "}{verifResult.msg}
            </div>
          )}
        </section>

        {/* Cara Penggunaan */}
        <section id="cara-pakai" style={S.guideSection}>
          <div style={S.guideHeader}>
            <div style={S.eyebrow}>panduan</div>
            <h2 style={S.h2}>Cara Penggunaan</h2>
          </div>
          <div style={S.guideList}>
            {[
              {
                n: "01",
                title: "Masukkan email kamu",
                desc: "Ketik atau paste alamat email di kolom Langkah 01, lalu klik tombol Kirim.",
              },
              {
                n: "02",
                title: "Cek inbox atau spam",
                desc: "Buka email dari Alight Creative. Jika tidak ada di inbox, periksa folder Spam atau Junk.",
              },
              {
                n: "03",
                title: "Salin link verifikasi",
                desc: "Di email, klik kanan tombol Login → Salin alamat tautan. Atau copy langsung teks link-nya.",
              },
              {
                n: "04",
                title: "Paste & verifikasi",
                desc: "Paste link tersebut di kolom Langkah 02, lalu klik Verif. Akun kamu langsung aktif.",
              },
            ].map(g => (
              <div className="guide-step" key={g.n}>
                <div className="guide-num">{g.n}</div>
                <div>
                  <div className="guide-title">{g.title}</div>
                  <div className="guide-desc">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer style={S.footer}>
        <span>AMACTIVATOR — znn-alightmotion.vercel.app</span>
        <span style={{ color: "var(--dim)" }}>made with ♥</span>
      </footer>
    </>
  );
}

const S = {
  header: {
    padding: "16px 24px 12px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    maxWidth: 860, margin: "0 auto",
  },
  logo: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 17, letterSpacing: 0.5,
    display: "flex", alignItems: "center", gap: 9,
    color: "var(--ink)",
  },
  logoDot: {
    width: 9, height: 9, borderRadius: "50%",
    background: "var(--mint)", boxShadow: "0 0 10px var(--mint)",
  },
  navLink: {
    color: "var(--dim)", textDecoration: "none",
    fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
  },
  main: {
    maxWidth: 860, margin: "0 auto", padding: "20px 24px 80px",
  },
  hero: {
    padding: "28px 0 28px",
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, letterSpacing: 2,
    color: "var(--mint)", textTransform: "uppercase",
    marginBottom: 14,
  },
  h1: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: "clamp(30px, 5vw, 50px)",
    lineHeight: 1.06, marginBottom: 14, letterSpacing: "-0.5px",
  },
  h2: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 26, letterSpacing: "-0.3px",
    marginBottom: 24, marginTop: 6,
  },
  sub: {
    color: "var(--dim)", fontSize: 15,
    maxWidth: 500, lineHeight: 1.6, marginBottom: 28,
  },
  hint: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: "var(--dim)", marginTop: 8,
  },
  guideSection: {
    borderTop: "1px solid var(--line)",
    paddingTop: 40,
  },
  guideHeader: { marginBottom: 8 },
  guideList: {
    borderTop: "1px solid var(--line)",
    marginTop: 8,
  },
  footer: {
    maxWidth: 860, margin: "0 auto",
    padding: "16px 24px",
    borderTop: "1px solid var(--line)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: "var(--dim)",
    display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
  },
};
