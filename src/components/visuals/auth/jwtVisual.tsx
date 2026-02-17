"use client";

import React, { useEffect, useState, useRef } from 'react';
import visualsData from "@/data/visuals";
import { useSettings } from "@/context/SettingsContext";
import { VisualLayout } from '@/components/layout/VisualLayout';

const visual = visualsData.visuals.find(v => v.id === "jwt")!;

export function JwtVisual() {
    const [replayCount, setReplayCount] = useState(0);
    const { animationsEnabled, animationSpeed } = useSettings();
    const flowSectionRef = useRef<HTMLHeadingElement>(null);
    const tokenBoxRef = useRef<HTMLDivElement>(null);

    // Animation State

    const [flowVisibleCount, setFlowVisibleCount] = useState(0);

    const runAnimation = () => {
        // Reset only flow
        setFlowVisibleCount(0);

        if (!animationsEnabled) {
            setFlowVisibleCount(9);
            return;
        }

        // Initial delay
        const start = 300 * animationSpeed;

        // Run Flow Steps
        for (let i = 1; i <= 9; i++) {
            setTimeout(() => setFlowVisibleCount(i), start + (i * 800 * animationSpeed));
        }
    };

    // Auto-scroll removed as per user request

    useEffect(() => {
        runAnimation();
    }, [replayCount, animationsEnabled]);

    const handleReplay = () => {
        setReplayCount(prev => prev + 1);
    };

    return (
        <VisualLayout
            category={visual.category}
            title={visual.title}
            description={visual.description}
            primaryColor={visual.colorConfig.primary}
            onReplay={handleReplay}
            contributors={visual.contributors}
        >
            {/* ═══════════════ STRUCTURE ═══════════════ */}
            <h2 className="section-title">Structure of a JWT</h2>

            <div className="viz-card-grid">
                {/* Header */}
                <div className="viz-box viz-reveal card-cyan visible">
                    <span className="viz-label">Header</span>
                    <pre className="viz-pre">{`{
  "alg": "HS256",
  "typ": "JWT"
}`}</pre>
                </div>

                {/* Payload */}
                <div className="viz-box viz-reveal card-purple visible">
                    <span className="viz-label">Payload</span>
                    <pre className="viz-pre">{`{
  "sub":  "1234567890",
  "name": "John Doe",
  "iat":  1516239022
}`}</pre>
                </div>

                {/* Signature */}
                <div className="viz-box viz-reveal card-yellow visible">
                    <span className="viz-label">Signature</span>
                    <pre className="viz-pre">{`HMAC-SHA256(
  base64Url(header) +
  "." +
  base64Url(payload),
  secret
)`}</pre>
                </div>
            </div>

            <div className="viz-arrow-down">▼</div>

            {/* Encode Row */}
            <div className="viz-row">
                <div className="viz-action action-cyan">
                    ⚙ Base 64 encode
                </div>
                <div className="viz-action action-purple">
                    ⚙ Base 64 encode
                </div>
                <div className="viz-action action-yellow">
                    compute
                </div>
            </div>

            <div className="viz-arrow-down">▼</div>

            {/* Combine */}
            <div className="viz-formula-wrap">
                <div className="viz-formula visible">
                    <span className="t-cyan">{`{{header}}`}</span>
                    <span>.</span>
                    <span className="t-purple">{`{{payload}}`}</span>
                    <span>.</span>
                    <span className="t-yellow">{`{{signature}}`}</span>
                </div>
            </div>

            <div className="viz-arrow-down">▼</div>

            {/* JWT Token */}
            <div ref={tokenBoxRef} className="viz-output-box viz-reveal card-green visible">
                <span className="viz-label">JWT</span>
                <p className="viz-output-text">
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

            <button className="viz-replay-btn" onClick={handleReplay} style={{ margin: '2rem auto 0' }}>
                ↺ Replay Animation
            </button>

            <div id="full-auth-flow" className="viz-fade-up visible">
                {/* ═══════════════ MERMAID FLOW ═══════════════ */}
                <h2 className="section-title">Full Authentication Flow</h2>

                <div className="viz-mermaid-wrap">
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
        </VisualLayout>
    );
}
