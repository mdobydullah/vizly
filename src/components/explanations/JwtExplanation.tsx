"use client";

import React, { useEffect, useState } from 'react';

export function JwtExplanation() {
  const [replayCount, setReplayCount] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation State
  const [structVisible, setStructVisible] = useState(false);
  const [encodePulse, setEncodePulse] = useState({ h: false, p: false, s: false });
  const [formulaVisible, setFormulaVisible] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [flowVisibleCount, setFlowVisibleCount] = useState(0);

  const runAnimation = () => {
    // Reset
    setStructVisible(false);
    setEncodePulse({ h: false, p: false, s: false });
    setFormulaVisible(false);
    setTokenVisible(false);
    setFlowVisibleCount(0);

    // Start Sequence
    setTimeout(() => {
      // 1. Structure Cards Fade In
      setStructVisible(true);

      // 2. Pulse Encoders
      setTimeout(() => setEncodePulse(prev => ({ ...prev, h: true })), 800);
      setTimeout(() => setEncodePulse(prev => ({ ...prev, p: true })), 1000);
      setTimeout(() => setEncodePulse(prev => ({ ...prev, s: true })), 1200);

      // 3. Show Formula
      setTimeout(() => setFormulaVisible(true), 1800);

      // 4. Show Token
      setTimeout(() => setTokenVisible(true), 2300);

      // 5. Run Flow Steps
      const baseDelay = 3200;
      for (let i = 1; i <= 8; i++) {
        setTimeout(() => setFlowVisibleCount(i), baseDelay + (i * 380));
      }
    }, 300);
  };

  useEffect(() => {
    runAnimation();
  }, [replayCount]);

  const handleReplay = () => {
    setReplayCount(prev => prev + 1);
  };

  return (
    <>
      <style jsx>{`
        :root {
          --bg: #0d0d0d;
          --cyan: #00e5ff;
          --purple: #c678dd;
          --yellow: #e5c07b;
          --green: #98c379;
          --blue: #61afef;
          --pink: #e06c75;
          --dim: #1e1e2e;
          --border: #2a2a3e;
        }

        .jwt-container {
          background: var(--bg);
          color: #abb2bf;
          font-family: 'Segoe UI', system-ui, sans-serif;
          min-height: 100vh;
          padding: 2rem 1rem 4rem;
        }

        .jwt-title {
          text-align: center;
          font-size: 1.6rem;
          color: #fff;
          margin-bottom: .3rem;
          font-weight: normal;
        }

        .jwt-title span {
          color: var(--cyan);
          background: #0a2a30;
          padding: .15em .5em;
          border-radius: 6px;
        }

        .jwt-subtitle {
          text-align: center;
          font-size: .75rem;
          color: #555;
          margin-top: .2rem;
          margin-bottom: 2.5rem;
        }

        .section-title {
          text-align: center;
          font-size: 1.3rem;
          color: #fff;
          margin: 2.5rem 0 1.5rem;
          font-weight: normal;
        }

        /* Card Styles */
        .card {
          background: var(--dim);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.2rem 1.4rem;
          font-size: .82rem;
          line-height: 1.6;
          position: relative;
        }

        .card-label {
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .05em;
          padding: .2em .6em;
          border-radius: 6px;
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        pre {
          font-family: 'Cascadia Code', 'Fira Code', monospace;
          font-size: .78rem;
          margin: 0;
        }

        /* Structure Grid */
        .struct-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          max-width: 860px;
          margin: 0 auto 1.4rem;
        }

        .header-card {
          border-color: var(--cyan);
          color: var(--cyan);
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity .5s .1s, transform .5s .1s;
        }

        .header-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .header-card .card-label {
          background: #0a2a30;
          color: var(--cyan);
          border: 1px solid var(--cyan);
        }

        .payload-card {
          border-color: var(--purple);
          color: var(--purple);
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity .5s .3s, transform .5s .3s;
        }

        .payload-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .payload-card .card-label {
          background: #1e0a30;
          color: var(--purple);
          border: 1px solid var(--purple);
        }

        .sig-card {
          border-color: var(--yellow);
          color: var(--yellow);
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity .5s .5s, transform .5s .5s;
        }

        .sig-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .sig-card .card-label {
          background: #1e1a00;
          color: var(--yellow);
          border: 1px solid var(--yellow);
        }

        /* Encode Row */
        .encode-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          max-width: 860px;
          margin: 0 auto 1.2rem;
        }

        .encode-box {
          text-align: center;
          padding: .6rem;
          border-radius: 8px;
          font-size: .78rem;
          font-weight: 600;
          letter-spacing: .03em;
          border: 1px solid;
        }

        .enc-cyan {
          border-color: var(--cyan);
          color: var(--cyan);
          background: #041215;
        }

        .enc-purple {
          border-color: var(--purple);
          color: var(--purple);
          background: #120415;
        }

        .enc-yellow {
          border-color: var(--yellow);
          color: var(--yellow);
          background: #15110a;
        }

        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 229, 255, .4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(0, 229, 255, 0);
          }
        }

        .enc-cyan.pulsing {
          animation: pulse-border .8s ease 2;
        }

        .enc-purple.pulsing {
          animation: pulse-border-purple .8s ease 2;
        }

        .enc-yellow.pulsing {
          animation: pulse-border-yellow .8s ease 2;
        }

        @keyframes pulse-border-purple {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(198, 120, 221, .4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(198, 120, 221, 0);
          }
        }

        @keyframes pulse-border-yellow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(229, 192, 123, .4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(229, 192, 123, 0);
          }
        }

        /* Arrow */
        .down-arrow {
          text-align: center;
          font-size: 1.1rem;
          color: #3a3a5c;
          line-height: 1;
          margin: .1rem 0;
          max-width: 860px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Combine Formula */
        .combine-wrap {
          max-width: 860px;
          margin: 0 auto;
          text-align: center;
        }

        .combine-formula {
          display: inline-block;
          border: 1px solid var(--green);
          border-radius: 8px;
          padding: .5rem 1.2rem;
          color: var(--green);
          font-family: monospace;
          font-size: .9rem;
          background: #051209;
          opacity: 0;
          transition: opacity .5s;
        }

        .combine-formula.visible {
          opacity: 1;
        }

        .combine-formula span {
          opacity: .6;
        }

        .t-cyan { color: var(--cyan); }
        .t-purple { color: var(--purple); }
        .t-yellow { color: var(--yellow); }

        /* Token Box */
        .token-box {
          max-width: 860px;
          margin: 1rem auto 0;
          border: 1px solid var(--green);
          border-radius: 10px;
          background: #051209;
          padding: 1rem 1.2rem;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transition: opacity .6s;
        }

        .token-box.visible {
          opacity: 1;
        }

        .token-box .card-label {
          background: #051209;
          color: var(--green);
          border: 1px solid var(--green);
        }

        .token-text {
          font-family: monospace;
          font-size: .72rem;
          word-break: break-all;
          line-height: 1.6;
        }

        /* Flow Steps */
        .flow-wrap {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: .6rem;
        }

        .flow-step {
          display: flex;
          align-items: center;
          gap: .8rem;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity .45s ease, transform .45s ease;
        }

        .flow-step.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: .8rem;
          flex-shrink: 0;
          border: 2px solid;
        }

        .step-body {
          flex: 1;
          background: var(--dim);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: .55rem .9rem;
          font-size: .82rem;
        }

        .step-actor {
          font-size: .72rem;
          opacity: .6;
          margin-bottom: .1rem;
          text-transform: uppercase;
          letter-spacing: .05em;
        }

        .step-desc {
          color: #cdd6f4;
        }

        /* Step Colors */
        .s1 .step-num { border-color: var(--blue); color: var(--blue); }
        .s2 .step-num { border-color: var(--cyan); color: var(--cyan); }
        .s3 .step-num { border-color: var(--green); color: var(--green); }
        .s4 .step-num { border-color: var(--purple); color: var(--purple); }
        .s5 .step-num { border-color: var(--blue); color: var(--blue); }
        .s6 .step-num { border-color: var(--cyan); color: var(--cyan); }
        .s7 .step-num { border-color: var(--yellow); color: var(--yellow); }
        .s8 .step-num { border-color: var(--green); color: var(--green); }

        /* Replay Button */
        .replay-btn {
          display: block;
          margin: 2rem auto 0;
          background: none;
          border: 1px solid var(--cyan);
          color: var(--cyan);
          padding: .5rem 1.4rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: .85rem;
          transition: background .2s;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .replay-btn:hover {
          background: #0a2a30;
        }

        /* Mobile Responsive */
        @media(max-width:600px) {
          .struct-grid,
          .encode-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="jwt-container">
        <h1 className="jwt-title">
          <span>JSON Web Token</span>
        </h1>
        <p className="jwt-subtitle">Learn JWT in a simple and visual way</p>

        {/* ═══════════════ STRUCTURE ═══════════════ */}
        <h2 className="section-title">Structure of a JWT</h2>

        <div className="struct-grid">
          {/* Header */}
          <div className={`card header-card ${structVisible ? 'visible' : ''}`}>
            <span className="card-label">Header</span>
            <pre>{`{
  "alg": "HS256",
  "typ": "JWT"
}`}</pre>
          </div>

          {/* Payload */}
          <div className={`card payload-card ${structVisible ? 'visible' : ''}`}>
            <span className="card-label">Payload</span>
            <pre>{`{
  "sub":  "1234567890",
  "name": "John Doe",
  "iat":  1516239022
}`}</pre>
          </div>

          {/* Signature */}
          <div className={`card sig-card ${structVisible ? 'visible' : ''}`}>
            <span className="card-label">Signature</span>
            <pre>{`HMAC-SHA256(
  base64Url(header) +
  "." +
  base64Url(payload),
  secret
)`}</pre>
          </div>
        </div>

        <div className="down-arrow">▼</div>

        {/* Encode Row */}
        <div className="encode-row">
          <div className={`encode-box enc-cyan ${encodePulse.h ? 'pulsing' : ''}`}>
            ⚙ Base 64 encode
          </div>
          <div className={`encode-box enc-purple ${encodePulse.p ? 'pulsing' : ''}`}>
            ⚙ Base 64 encode
          </div>
          <div className={`encode-box enc-yellow ${encodePulse.s ? 'pulsing' : ''}`}>
            compute
          </div>
        </div>

        <div className="down-arrow">▼</div>

        {/* Combine */}
        <div className="combine-wrap">
          <div className={`combine-formula ${formulaVisible ? 'visible' : ''}`}>
            <span className="t-cyan">{`{{header}}`}</span>
            <span>.</span>
            <span className="t-purple">{`{{payload}}`}</span>
            <span>.</span>
            <span className="t-yellow">{`{{signature}}`}</span>
          </div>
        </div>

        <div className="down-arrow">▼</div>

        {/* JWT Token */}
        <div className={`token-box ${tokenVisible ? 'visible' : ''}`}>
          <span className="card-label">JWT</span>
          <p className="token-text">
            <span className="t-cyan">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.
            <span className="t-purple">eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ</span>.
            <span className="t-yellow">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
          </p>
        </div>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <h2 className="section-title">How JWT Works?</h2>

        <div className="flow-wrap">
          <div className={`flow-step s1 ${flowVisibleCount >= 1 ? 'visible' : ''}`}>
            <div className="step-num">1</div>
            <div className="step-body">
              <div className="step-actor">👤 User → Browser</div>
              <div className="step-desc">User fills in credentials and clicks <strong>Log In</strong></div>
            </div>
          </div>

          <div className={`flow-step s2 ${flowVisibleCount >= 2 ? 'visible' : ''}`}>
            <div className="step-num">2</div>
            <div className="step-body">
              <div className="step-actor">🌐 Browser → Backend Server</div>
              <div className="step-desc">Browser sends credentials in a POST /login request — <strong>Authenticate</strong></div>
            </div>
          </div>

          <div className={`flow-step s3 ${flowVisibleCount >= 3 ? 'visible' : ''}`}>
            <div className="step-num">3</div>
            <div className="step-body">
              <div className="step-actor">🖥 Backend Server</div>
              <div className="step-desc">Server validates credentials, then <strong>creates &amp; signs</strong> a JWT using a secret key</div>
            </div>
          </div>

          <div className={`flow-step s4 ${flowVisibleCount >= 4 ? 'visible' : ''}`}>
            <div className="step-num">4</div>
            <div className="step-body">
              <div className="step-actor">🖥 Backend Server → Browser</div>
              <div className="step-desc">Server responds with <strong>Cookie + JWT</strong>; browser stores the token</div>
            </div>
          </div>

          <div className={`flow-step s5 ${flowVisibleCount >= 5 ? 'visible' : ''}`}>
            <div className="step-num">5</div>
            <div className="step-body">
              <div className="step-actor">👤 User</div>
              <div className="step-desc">User navigates to a <strong>protected page</strong> inside the app</div>
            </div>
          </div>

          <div className={`flow-step s6 ${flowVisibleCount >= 6 ? 'visible' : ''}`}>
            <div className="step-num">6</div>
            <div className="step-body">
              <div className="step-actor">🌐 Browser → Backend Server</div>
              <div className="step-desc">Browser attaches the JWT in the <code>Authorization</code> header: <strong>Request + Cookie</strong></div>
            </div>
          </div>

          <div className={`flow-step s7 ${flowVisibleCount >= 7 ? 'visible' : ''}`}>
            <div className="step-num">7</div>
            <div className="step-body">
              <div className="step-actor">🖥 Backend Server</div>
              <div className="step-desc">Server <strong>verifies</strong> JWT signature using the secret — checks expiry &amp; claims</div>
            </div>
          </div>

          <div className={`flow-step s8 ${flowVisibleCount >= 8 ? 'visible' : ''}`}>
            <div className="step-num">8</div>
            <div className="step-body">
              <div className="step-actor">🖥 Backend Server → Browser</div>
              <div className="step-desc">Verification passes — server returns <strong>Response Data</strong> 🎉</div>
            </div>
          </div>
        </div>

        <button className="replay-btn" onClick={handleReplay}>
          ↺ Replay animation
        </button>
      </div>
    </>
  );
}
