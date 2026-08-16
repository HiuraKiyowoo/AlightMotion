import { useState } from "react";

const SEND_URL   = "/api/send";
const VERIFY_URL = "/api/verify";

function extractLink(raw) {
  const match = raw.match(/ActionWinOpenPassBase64\(['"]([A-Za-z0-9+/=]+)['"]\)/);
  if (match) return atob(match[1]);
  return raw;
}

export default function App() {
  const [tab, setTab]     = useState("send");
  const [email, setEmail] = useState("");
  const [link, setLink]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

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
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060D18;
          background-image:
            linear-gradient(rgba(0,240,180,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,180,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          min-height: 100vh;
        }

        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes glitch {
          0%,100%{text-shadow: 2px 0 #FF2D6B, -2px 0 #00F0B4}
          33%    {text-shadow:-2px 0 #FF2D6B,  2px 0 #00F0B4}
          66%    {text-shadow: 2px 2px #FF2D6B,-2px -2px #00F0B4}
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .scanline {
          position: fixed; top: 0; left: 0; width: 100%; height: 40px;
          background: linear-gradient(transparent, rgba(0,240,180,0.04), transparent);
          pointer-events: none; z-index: 0;
          animation: scanline 6s linear infinite;
        }

        input, textarea, button { font-family: 'VT323', monospace; }

        input:focus, textarea:focus {
          outline: none !important;
          border-color: #FFD60A !important;
          box-shadow: 4px 4px 0 #FFD60A !important;
          caret-color: #FFD60A;
        }

        .px-btn {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          background: #00F0B4;
          color: #060D18;
          border: none;
          padding: 14px 20px;
          cursor: pointer;
          width: 100%;
          border-bottom: 4px solid #009970;
          border-right: 4px solid #009970;
          border-top: 4px solid #80FBD8;
          border-left: 4px solid #80FBD8;
          transition: transform 0.05s;
          letter-spacing: 1px;
          line-height: 1.8;
        }
        .px-btn:hover:not(:disabled) {
          background: #FFD60A;
          border-bottom-color: #9A8200;
          border-right-color: #9A8200;
          border-top-color: #FFED80;
          border-left-color: #FFED80;
        }
        .px-btn:active:not(:disabled) {
          transform: translate(2px, 2px);
          border-bottom-width: 2px;
          border-right-width: 2px;
        }
        .px-btn:disabled {
          background: #1A3040;
          color: #2A5060;
          border-color: #1A3040;
          cursor: not-allowed;
        }

        .px-tab {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          background: transparent;
          color: #2A6050;
          border: none;
          border-bottom: 4px solid transparent;
          padding: 16px 8px;
          cursor: pointer;
          width: 100%;
          transition: color 0.1s, border-color 0.1s;
          line-height: 2;
          letter-spacing: 0.5px;
        }
        .px-tab:hover { color: #00F0B4; }
        .px-tab.active {
          color: #00F0B4;
          border-bottom: 4px solid #00F0B4;
          background: rgba(0,240,180,0.04);
        }

        .px-input {
          background: #030810;
          border-top: 2px solid #0A2535;
          border-left: 2px solid #0A2535;
          border-bottom: 2px solid #1A6050;
          border-right: 2px solid #1A6050;
          color: #00F0B4;
          font-family: 'VT323', monospace;
          font-size: 20px;
          padding: 10px 12px;
          width: 100%;
          transition: border-color 0.1s, box-shadow 0.1s;
          letter-spacing: 1px;
        }

        .px-textarea {
          height: 110px;
          resize: none;
          line-height: 1.5;
          font-size: 17px;
        }

        ::placeholder { color: #1A4535; }
      `}</style>

      <div className="scanline" />

      <div style={S.root}>
        <div style={S.card}>

          {/* ── Header ── */}
          <div style={S.head}>
            <div style={S.logoRow}>
              <div style={S.logo}>AM</div>
              <div style={S.titleBlock}>
                <div style={S.eyebrow}>// ALIGHT CREATIVE</div>
                <h1 style={S.title}>AKTIVASI</h1>
              </div>
            </div>
            <div style={S.divider} />
            <p style={S.sub}>
              <span style={S.cursor}>▋</span> MASUKKAN EMAIL DAN LINK VERIF
            </p>
          </div>

          {/* ── Tabs ── */}
          <div style={S.tabs}>
            <button className={`px-tab ${tab === "send" ? "active" : ""}`}
              onClick={() => switchTab("send")}>
              [1] KIRIM KODE
            </button>
            <button className={`px-tab ${tab === "verif" ? "active" : ""}`}
              onClick={() => switchTab("verif")}>
              [2] VERIFIKASI
            </button>
          </div>

          {/* ── Body ── */}
          <div style={S.body}>

            {tab === "send" ? (
              <div style={S.fields}>
                <label style={S.label}>&gt; ALAMAT EMAIL</label>
                <input
                  className="px-input"
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                />
                <div style={{ height: 12 }} />
                <button className="px-btn" onClick={handleSend}
                  disabled={loading || !email.trim()}>
                  {loading ? "MENGIRIM..." : "► KIRIM KODE AKTIVASI"}
                </button>
                <p style={S.hint}>* CEK INBOX / SPAM SETELAH KIRIM</p>
              </div>
            ) : (
              <div style={S.fields}>
                {email && (
                  <div style={S.emailTag}>
                    <span style={S.dot} />
                    EMAIL: {email}
                  </div>
                )}
                <label style={S.label}>&gt; LINK VERIFIKASI</label>
                <textarea
                  className="px-input px-textarea"
                  placeholder="PASTE LINK DARI EMAIL DI SINI..."
                  value={link}
                  onChange={e => setLink(e.target.value)}
                />
                <div style={{ height: 12 }} />
                <button className="px-btn" onClick={handleVerif}
                  disabled={loading || !link.trim()}>
                  {loading ? "MEMPROSES..." : "► VERIFIKASI SEKARANG"}
                </button>
                {!email && (
                  <p style={{ ...S.hint, color: "#FF2D6B" }}>
                    ! KIRIM KODE DI TAB [1] DULU
                  </p>
                )}
              </div>
            )}

            {/* ── Result ── */}
            {result && (
              <div style={{ ...S.result, ...(result.ok ? S.resultOk : S.resultErr) }}>
                <div style={S.resultHead}>
                  {result.ok ? "[ OK ] BERHASIL" : "[ERR] GAGAL"}
                </div>
                <div style={S.resultMsg}>{result.msg}</div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={S.foot}>
            <span style={S.footTxt}>ZNN-ALIGHTMOTION.VERCEL.APP</span>
          </div>

        </div>
      </div>
    </>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
    position: "relative", zIndex: 1,
  },
  card: {
    width: "100%", maxWidth: 400,
    background: "#080F1C",
    borderTop: "4px solid #00F0B4",
    borderLeft: "4px solid #00F0B4",
    borderBottom: "4px solid #006B50",
    borderRight: "4px solid #006B50",
    boxShadow: "6px 6px 0 #001A10",
  },
  head: {
    padding: "24px 24px 16px",
    borderBottom: "2px solid #0A2535",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 16, marginBottom: 14,
  },
  logo: {
    width: 52, height: 52,
    background: "#00F0B4",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 14, color: "#060D18", fontWeight: 400,
    borderBottom: "4px solid #006B50",
    borderRight: "4px solid #006B50",
    borderTop: "4px solid #80FBD8",
    borderLeft: "4px solid #80FBD8",
    flexShrink: 0,
  },
  titleBlock: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  eyebrow: {
    fontFamily: "'VT323', monospace",
    fontSize: 16, color: "#1A6050", letterSpacing: 2,
  },
  title: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 18, color: "#00F0B4",
    letterSpacing: 2,
    textShadow: "2px 2px 0 #006B50",
    animation: "glitch 5s ease-in-out infinite",
  },
  divider: {
    height: 2,
    background: "repeating-linear-gradient(90deg, #00F0B4 0, #00F0B4 8px, transparent 8px, transparent 16px)",
    marginBottom: 12,
  },
  sub: {
    fontFamily: "'VT323', monospace",
    fontSize: 16, color: "#1A6050", letterSpacing: 2,
  },
  cursor: {
    animation: "blink 1s step-end infinite",
    color: "#00F0B4",
  },
  tabs: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    borderBottom: "2px solid #0A2535",
  },
  body: {
    padding: "20px 24px 24px",
  },
  fields: {
    display: "flex", flexDirection: "column",
  },
  label: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 8, color: "#00A070",
    letterSpacing: 1, marginBottom: 8,
    lineHeight: 2,
  },
  hint: {
    fontFamily: "'VT323', monospace",
    fontSize: 15, color: "#1A5040",
    letterSpacing: 1, marginTop: 10,
    lineHeight: 1.5,
  },
  emailTag: {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'VT323', monospace",
    fontSize: 18, color: "#00F0B4",
    letterSpacing: 1,
    background: "rgba(0,240,180,0.06)",
    borderLeft: "3px solid #00F0B4",
    padding: "8px 12px",
    marginBottom: 14,
  },
  dot: {
    width: 8, height: 8,
    background: "#00F0B4",
    flexShrink: 0,
    animation: "blink 1.5s step-end infinite",
  },
  result: {
    marginTop: 16,
    padding: "12px 14px",
    borderLeft: "4px solid",
  },
  resultOk: {
    background: "rgba(0,240,180,0.05)",
    borderLeftColor: "#00F0B4",
  },
  resultErr: {
    background: "rgba(255,45,107,0.05)",
    borderLeftColor: "#FF2D6B",
  },
  resultHead: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 8, marginBottom: 8,
    letterSpacing: 1, lineHeight: 2,
    color: "#00F0B4",
  },
  resultMsg: {
    fontFamily: "'VT323', monospace",
    fontSize: 18, color: "#1A8060",
    letterSpacing: 1, lineHeight: 1.5,
  },
  foot: {
    borderTop: "2px solid #0A2535",
    padding: "10px 24px",
    textAlign: "center",
  },
  footTxt: {
    fontFamily: "'VT323', monospace",
    fontSize: 14, color: "#0A3525",
    letterSpacing: 2,
  },
};
