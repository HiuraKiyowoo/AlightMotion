import { useState } from "react";

const SEND_URL   = "/api/send";
const VERIFY_URL = "/api/verify";

function extractLink(raw) {
  const match = raw.match(/ActionWinOpenPassBase64\(['"]([A-Za-z0-9+/=]+)['"]\)/);
  if (match) return atob(match[1]);
  return raw;
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
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { status: false, message: text.slice(0, 200) || `HTTP ${res.status}` }; }
  }

  async function handleSend() {
    if (!email.trim()) return;
    setSending(true); setSendResult(null);
    try {
      const data = await safePost(SEND_URL, { email: email.trim() });
      setSendResult({ ok: data.status, msg: data.message });
      if (data.status) setSent(true);
    } catch (e) { setSendResult({ ok: false, msg: e.message }); }
    setSending(false);
  }

  async function handleVerif() {
    if (!link.trim()) return;
    setVerifying(true); setVerifResult(null);
    try {
      const decoded = extractLink(link.trim());
      const data = await safePost(VERIFY_URL, { email: email.trim(), link: decoded });
      setVerifResult({ ok: data.status, msg: data.message });
    } catch (e) { setVerifResult({ ok: false, msg: e.message }); }
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

        /* ── Step card ── */
        .step-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
        }

        .step-head {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--line);
        }
        .step-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 700; letter-spacing: 1px;
          color: var(--mint);
          background: rgba(93,255,184,0.08);
          border: 1px solid rgba(93,255,184,0.2);
          border-radius: 5px;
          padding: 3px 8px;
        }
        .step-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 1.5px;
          color: var(--dim); text-transform: uppercase;
        }

        .step-body {
          display: flex; align-items: stretch;
          height: 88px;
        }
        .step-body input,
        .step-body textarea {
          flex: 1;
          background: transparent; border: 0; outline: 0;
          color: var(--ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          padding: 0 18px;
          resize: none;
          line-height: 1.55;
        }
        .step-body input { height: 100%; }
        .step-body textarea { padding-top: 18px; }
        .step-body input::placeholder,
        .step-body textarea::placeholder { color: #3D3B52; }

        .step-divider {
          width: 1px; background: var(--line); flex: none;
        }

        .step-btn {
          background: transparent;
          border: 0;
          color: var(--mint);
          font-family: 'Archivo Black', sans-serif;
          font-size: 12px; letter-spacing: 1px;
          cursor: pointer;
          padding: 0 22px;
          flex: none;
          transition: background .15s, color .15s;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .step-btn:hover:not(:disabled) {
          background: rgba(93,255,184,0.07);
        }
        .step-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .scanline {
          height: 2px; width: 100%;
          background: linear-gradient(90deg, transparent, var(--mint), transparent);
          background-size: 200% 100%;
          animation: scan 1.2s linear infinite;
          border-radius: 0 0 14px 14px;
        }

        .status-msg {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; margin-top: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--line);
        }
        .status-msg.ok  { border-color: rgba(93,255,184,0.25); color: var(--mint); background: rgba(93,255,184,0.05); }
        .status-msg.err { border-color: rgba(255,82,82,0.25);  color: var(--red);  background: rgba(255,82,82,0.05); }

        .hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--dim); margin-top: 9px;
        }

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

        a { color: var(--mint); text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <main style={S.main}>

        {/* Hero */}
        <section style={S.hero}>
          <h1 style={S.h1}>
            HIURA<br />
            <span style={{ color: "var(--mint)" }}>ALIGHT MOTION.</span>
          </h1>
          <p style={S.sub}>
            Kirim kode aktivasi ke email, lalu paste link verifikasi dari inbox kamu.
            Proses selesai dalam hitungan detik.
          </p>
        </section>

        {/* Step 1 */}
        <section style={{ marginBottom: 16 }}>
          <div className="step-card">
            <div className="step-head">
              <span className="step-num">01</span>
              <span className="step-title">Kirim Kode</span>
            </div>
            <div className="step-body">
              <input
                type="email"
                placeholder="alamat email kamu..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
              />
              <div className="step-divider" />
              <button className="step-btn" onClick={handleSend}
                disabled={sending || !email.trim()}>
                {sending ? "Mengirim…" : "Kirim"}
              </button>
            </div>
            {sending && <div className="scanline" />}
          </div>
          <div className="hint">Cek folder inbox dan spam setelah klik Kirim.</div>
          {sendResult && (
            <div className={`status-msg ${sendResult.ok ? "ok" : "err"}`}>
              {sendResult.ok ? "✓ " : "✗ "}{sendResult.msg}
            </div>
          )}
        </section>

        {/* Step 2 */}
        <section style={{ marginBottom: 56 }}>
          {email && sent && (
            <div className="email-tag">
              <div className="email-dot" />
              {email}
            </div>
          )}
          <div className="step-card">
            <div className="step-head">
              <span className="step-num">02</span>
              <span className="step-title">Verifikasi Link</span>
            </div>
            <div className="step-body">
              <textarea
                placeholder="Paste link verifikasi dari email di sini..."
                value={link}
                onChange={e => setLink(e.target.value)}
              />
              <div className="step-divider" />
              <button className="step-btn" onClick={handleVerif}
                disabled={verifying || !link.trim()}>
                {verifying ? "Proses…" : "Verif"}
              </button>
            </div>
            {verifying && <div className="scanline" />}
          </div>
          {!sent && (
            <div className="hint" style={{ color: "rgba(255,82,82,0.7)" }}>
              ! Selesaikan langkah 01 terlebih dahulu.
            </div>
          )}
          {verifResult && (
            <div className={`status-msg ${verifResult.ok ? "ok" : "err"}`}>
              {verifResult.ok ? "✓ " : "✗ "}{verifResult.msg}
            </div>
          )}
        </section>

        {/* Cara Penggunaan */}
        <section style={S.guideSection}>
          <div style={S.guideHeader}>
            <div style={S.eyebrow}>panduan</div>
            <h2 style={S.h2}>Cara Penggunaan</h2>
          </div>
          <div style={S.guideList}>
            {[
              { n: "01", title: "Masukkan email kamu", desc: "Ketik atau paste alamat email di kolom Langkah 01, lalu klik tombol Kirim." },
              { n: "02", title: "Cek inbox atau spam", desc: "Buka email dari Alight Creative. Jika tidak ada di inbox, periksa folder Spam atau Junk." },
              { n: "03", title: "Salin link verifikasi", desc: "Di email, klik kanan tombol Login → Salin alamat tautan. Atau copy langsung teks link-nya." },
              { n: "04", title: "Paste & verifikasi", desc: "Paste link tersebut di kolom Langkah 02, lalu klik Verif. Akun kamu langsung aktif." },
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

      <footer style={{ textAlign: "center", padding: "24px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--dim)" }}>
        HIURA AMACTIVATOR
      </footer>
    </>
  );
}

const S = {
  main: {
    maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px",
  },
  hero: {
    paddingBottom: 40,
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, letterSpacing: 2,
    color: "var(--mint)", textTransform: "uppercase",
    marginBottom: 14,
  },
  h1: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: "clamp(36px, 6vw, 58px)",
    lineHeight: 1.06, marginBottom: 14, letterSpacing: "-0.5px",
  },
  h2: {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: 22, letterSpacing: "-0.3px",
    marginBottom: 24, marginTop: 6,
  },
  sub: {
    color: "var(--dim)", fontSize: 14,
    maxWidth: 460, lineHeight: 1.65,
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
};
