"use client";

import React, { useEffect, useState, useRef } from 'react';
import visualsData from "@/data/visuals.json";
import mermaid from 'mermaid';
import { useSettings } from "@/context/SettingsContext";

const visual = visualsData.visuals.find(v => v.id === "jwt")!;

export function JwtExplanation() {
  const [replayCount, setReplayCount] = useState(0);
  const { animationsEnabled, animationSpeed } = useSettings();
  const flowSectionRef = useRef<HTMLHeadingElement>(null);
  const tokenBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'var(--font-mono)',
      themeVariables: {
        primaryColor: '#00e5ff',
        primaryTextColor: '#fff',
        primaryBorderColor: '#00e5ff',
        lineColor: '#5a6a7e',
        secondaryColor: '#b985f4',
        tertiaryColor: '#3effa3'
      }
    });
    mermaid.contentLoaded();
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

    if (!animationsEnabled) {
      setStructVisible(true);
      setEncodePulse({ h: false, p: false, s: false });
      setFormulaVisible(true);
      setTokenVisible(true);
      setFlowVisibleCount(9);
      return;
    }

    // Initial delay
    const start = 300 * animationSpeed;

    // 1. Structure Cards Fade In
    setTimeout(() => setStructVisible(true), start);

    // 2. Pulse Encoders
    setTimeout(() => setEncodePulse(prev => ({ ...prev, h: true })), start + (800 * animationSpeed));
    setTimeout(() => setEncodePulse(prev => ({ ...prev, p: true })), start + (1000 * animationSpeed));
    setTimeout(() => setEncodePulse(prev => ({ ...prev, s: true })), start + (1200 * animationSpeed));

    // 3. Show Formula
    setTimeout(() => setFormulaVisible(true), start + (1800 * animationSpeed));

    // 4. Show Token
    setTimeout(() => setTokenVisible(true), start + (2300 * animationSpeed));

    // 5. Run Flow Steps
    const flowStart = start + (3200 * animationSpeed);
    for (let i = 1; i <= 9; i++) {
      setTimeout(() => setFlowVisibleCount(i), flowStart + (i * 1000 * animationSpeed));
    }
  };

  // Natural "Human" Progressive Scroll
  useEffect(() => {
    if (!animationsEnabled) return;
    if (tokenVisible && flowVisibleCount === 0) {
      const timer = setTimeout(() => {
        tokenBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200 * animationSpeed);
      return () => clearTimeout(timer);
    }
  }, [tokenVisible, animationsEnabled, animationSpeed]);

  useEffect(() => {
    if (!animationsEnabled || flowVisibleCount === 0) return;

    // Slight delay to mimic human reaction time after seeing new content
    const timer = setTimeout(() => {
      if (flowVisibleCount === 1) {
        flowSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (flowVisibleCount === 9) {
        const fullFlowSection = document.getElementById('full-auth-flow');
        fullFlowSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const activeStep = document.querySelector(`.flow-step.s${flowVisibleCount}`);
        if (activeStep) {
          activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 150 * animationSpeed);
    return () => clearTimeout(timer);
  }, [flowVisibleCount, animationsEnabled, animationSpeed]);

  useEffect(() => {
    runAnimation();
  }, [replayCount, animationsEnabled]);

  const handleReplay = () => {
    window.scrollTo({ top: 0 });
    setReplayCount(prev => prev + 1);
  };

  return (
    <>
      <style jsx>{`
        /* JWT Specific Animations & Colors */
        .header-card { border-color: var(--cyan); color: var(--cyan); opacity: 0; transform: translateY(-20px); transition: opacity .5s .1s, transform .5s .1s; }
        .header-card.visible { opacity: 1; transform: translateY(0); }
        .header-card :global(.visual-label) { background: #0a2a30; color: var(--cyan); border: 1px solid var(--cyan); }

        .payload-card { border-color: var(--purple); color: var(--purple); opacity: 0; transform: translateY(-20px); transition: opacity .5s .3s, transform .5s .3s; }
        .payload-card.visible { opacity: 1; transform: translateY(0); }
        .payload-card :global(.visual-label) { background: #1e0a30; color: var(--purple); border: 1px solid var(--purple); }

        .sig-card { border-color: var(--yellow); color: var(--yellow); opacity: 0; transform: translateY(-20px); transition: opacity .5s .5s, transform .5s .5s; }
        .sig-card.visible { opacity: 1; transform: translateY(0); }
        .sig-card :global(.visual-label) { background: #1e1a00; color: var(--yellow); border: 1px solid var(--yellow); }

        .visual-formula { opacity: 0; transition: opacity .5s; }
        .visual-formula.visible { opacity: 1; }
        .visual-formula span { opacity: .6; }

        .visual-output-box { opacity: 0; transition: opacity .6s; }
        .visual-output-box.visible { opacity: 1; }
        .visual-output-box :global(.visual-label) { background: #051209; color: var(--green); border: 1px solid var(--green); }

        /* Pulses */
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, .4); }
          50% { box-shadow: 0 0 0 6px rgba(0, 229, 255, 0); }
        }
        @keyframes pulse-border-purple {
          0%, 100% { box-shadow: 0 0 0 0 rgba(198, 120, 221, .4); }
          50% { box-shadow: 0 0 0 6px rgba(198, 120, 221, 0); }
        }
        @keyframes pulse-border-yellow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(229, 192, 123, .4); }
          50% { box-shadow: 0 0 0 6px rgba(229, 192, 123, 0); }
        }

        .enc-cyan { border-color: var(--cyan); color: var(--cyan); background: #041215; }
        .enc-cyan.pulsing { animation: pulse-border .8s ease 2; }
        .enc-purple { border-color: var(--purple); color: var(--purple); background: #120415; }
        .enc-purple.pulsing { animation: pulse-border-purple .8s ease 2; }
        .enc-yellow { border-color: var(--yellow); color: var(--yellow); background: #15110a; }
        .enc-yellow.pulsing { animation: pulse-border-yellow .8s ease 2; }

        .full-flow-section { 
          opacity: 0; 
          transform: translateY(20px); 
          transition: opacity 0.6s ease, transform 0.6s ease; 
        }
        .full-flow-section.visible { 
          opacity: 1; 
          transform: translateY(0); 
        }
      `}</style>

      <div className="visual-container">

        {/* Section Title */}
        <div className="section-title-container" style={{
          padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem)',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '.7rem',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            color: 'var(--cyan)',
            marginBottom: '0.2rem',
            opacity: .8
          }}>
            {visual.category}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-hi)',
            letterSpacing: '-.02em'
          }}>{visual.title}</h2>
          <p className="section-hint" style={{
            color: 'var(--text-dim)',
            fontSize: '.8rem',
            maxWidth: '500px',
            textAlign: 'center'
          }}>{visual.description}</p>
        </div>

        <div style={{
          maxWidth: '860px',
          margin: '0 auto 2.5rem',
          padding: '1.5rem',
          background: 'rgba(0, 229, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          fontSize: '.88rem',
          color: 'var(--text)',
          lineHeight: '1.7',
          textAlign: 'center'
        }}>
          JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.
        </div>

        {/* ═══════════════ STRUCTURE ═══════════════ */}
        <h2 className="section-title">Structure of a JWT</h2>

        <div className="visual-card-grid">
          {/* Header */}
          <div className={`visual-box header-card ${structVisible ? 'visible' : ''}`}>
            <span className="visual-label">Header</span>
            <pre className="visual-pre">{`{
  "alg": "HS256",
  "typ": "JWT"
}`}</pre>
          </div>

          {/* Payload */}
          <div className={`visual-box payload-card ${structVisible ? 'visible' : ''}`}>
            <span className="visual-label">Payload</span>
            <pre className="visual-pre">{`{
  "sub":  "1234567890",
  "name": "John Doe",
  "iat":  1516239022
}`}</pre>
          </div>

          {/* Signature */}
          <div className={`visual-box sig-card ${structVisible ? 'visible' : ''}`}>
            <span className="visual-label">Signature</span>
            <pre className="visual-pre">{`HMAC-SHA256(
  base64Url(header) +
  "." +
  base64Url(payload),
  secret
)`}</pre>
          </div>
        </div>

        <div className="visual-arrow-down">▼</div>

        {/* Encode Row */}
        <div className="visual-row">
          <div className={`visual-action-box enc-cyan ${encodePulse.h ? 'pulsing' : ''}`}>
            ⚙ Base 64 encode
          </div>
          <div className={`visual-action-box enc-purple ${encodePulse.p ? 'pulsing' : ''}`}>
            ⚙ Base 64 encode
          </div>
          <div className={`visual-action-box enc-yellow ${encodePulse.s ? 'pulsing' : ''}`}>
            compute
          </div>
        </div>

        <div className="visual-arrow-down">▼</div>

        {/* Combine */}
        <div className="visual-formula-wrap">
          <div className={`visual-formula ${formulaVisible ? 'visible' : ''}`}>
            <span className="t-cyan">{`{{header}}`}</span>
            <span>.</span>
            <span className="t-purple">{`{{payload}}`}</span>
            <span>.</span>
            <span className="t-yellow">{`{{signature}}`}</span>
          </div>
        </div>

        <div className="visual-arrow-down">▼</div>

        {/* JWT Token */}
        <div ref={tokenBoxRef} className={`visual-output-box ${tokenVisible ? 'visible' : ''}`}>
          <span className="visual-label">JWT</span>
          <p className="visual-output-text">
            <span className="t-cyan">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>
            <span>.</span>
            <span className="t-purple">eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ</span>
            <span>.</span>
            <span className="t-yellow">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
          </p>
        </div>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <h2 ref={flowSectionRef} className="section-title">How JWT Works?</h2>

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

        <div id="full-auth-flow" className={`full-flow-section ${flowVisibleCount >= 9 ? 'visible' : ''}`} style={{
          pointerEvents: flowVisibleCount >= 9 ? 'all' : 'none'
        }}>
          {/* ═══════════════ MERMAID FLOW ═══════════════ */}
          <h2 className="section-title">Full Authentication Flow</h2>

          <div style={{
            maxWidth: '860px',
            margin: '2rem auto',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            overflowX: 'auto'
          }}>
            <div className="mermaid">
              {`sequenceDiagram
      autonumber
      participant U as 👤 User
      participant B as 🌐 Browser
      participant S as 🖥 Backend Server
  
      U->>B: 1. Fill credentials & Login
      B->>S: 2. POST /login (Authenticate)
      Note right of S: 3. Validate & Create JWT
      S->>B: 4. Response (Cookie + JWT)
      U->>B: 5. Navigates to protected page
      B->>S: 6. Request (Auth: Bearer JWT)
      Note right of S: 7. Verify Signature & Claims
      S->>B: 8. Send Response Data 🎉`}
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
