import LegalPage, { LegalSection } from "@/components/common/LegalPage";
import { config } from "@/lib/config";

const linkStyle = { color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 };

const sections: LegalSection[] = [
    {
        title: "The short version",
        body: (
            <>
                Vizly has no accounts, no sign up and no contact forms. We never ask you for your
                name, your email address or any other personal detail, so there is nothing for us
                to sell, share or lose. What follows explains the small amount of data that any
                website unavoidably handles.
            </>
        ),
    },
    {
        title: "Information we do not collect",
        body: (
            <>
                We do not collect names, email addresses, phone numbers, postal addresses or
                payment details. We do not run user accounts, newsletters or comment threads.
                We do not sell or rent data to anyone, and we do not use your data to train
                machine learning models.
            </>
        ),
    },
    {
        title: "Data stored in your browser",
        body: (
            <>
                Your display settings, such as the theme and language preference, are saved in your
                browser using local storage. This data stays on your device, is never transmitted
                to us and is not readable by other websites. Clearing your browser storage removes
                it permanently.
            </>
        ),
    },
    {
        title: "Analytics",
        body: (
            <>
                We use Google Tag Manager and Google Analytics to understand which pages and
                visuals people find useful. These tools record technical information such as the
                pages you visit, the approximate region you connect from, your browser and device
                type, and the site that referred you. We use this only in aggregate to decide what
                to build next, and we never attempt to identify individual visitors.
                <br /><br />
                Google processes this information under its own privacy policy. You can opt out
                using the{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Google Analytics opt out add on
                </a>
                , a browser that blocks trackers, or any standard content blocker. The site works
                fully with analytics blocked.
            </>
        ),
    },
    {
        title: "Server logs and video delivery",
        body: (
            <>
                Our hosting provider and our content delivery network keep short lived request logs
                that include IP addresses, timestamps and requested URLs. These logs exist to keep
                the site available and to defend against abuse. Videos are served from our own
                content delivery network at cdn.vizly.dev, so watching a video on Vizly does not
                report your activity back to a social platform.
            </>
        ),
    },
    {
        title: "Links to other services",
        body: (
            <>
                Vizly links out to external sites, including our profiles on YouTube, Instagram,
                TikTok, Facebook and GitHub. Once you follow a link, that service collects data
                under its own policy, which we do not control. Watching a Vizly video on one of
                those platforms is governed by that platform, not by this policy.
            </>
        ),
    },
    {
        title: "Children",
        body: (
            <>
                Vizly is written for working engineers and students of software engineering. It is
                not directed at children under 13, and we do not knowingly collect information
                from them.
            </>
        ),
    },
    {
        title: "Your rights",
        body: (
            <>
                Because we hold no personal records, there is no account to export or delete. You
                can remove everything Vizly has placed on your device by clearing your browser
                storage for this site, and you can prevent analytics entirely by blocking it in
                your browser. If you are in a region covered by the GDPR, the CCPA or a similar
                law and you want to exercise a right, contact us and we will help.
            </>
        ),
    },
    {
        title: "Changes to this policy",
        body: (
            <>
                If this policy changes in a way that affects what we collect, we will update the
                date at the top of this page. The full history of edits is public in the{" "}
                <a href={config.urls.githubRepo} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Vizly repository
                </a>
                , so you can see exactly what changed and when.
            </>
        ),
    },
    {
        title: "Contact",
        body: (
            <>
                Questions about privacy can be raised as an issue on the{" "}
                <a href={config.urls.githubRepo} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Vizly GitHub repository
                </a>
                , or sent through{" "}
                <a href="https://obydul.me" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    obydul.me
                </a>
                . Vizly is an independent project maintained by Obydul.
            </>
        ),
    },
];

export default function PrivacyPolicyPage() {
    return (
        <LegalPage
            eyebrow="✦ Privacy"
            title="Privacy Policy"
            intro="Vizly is a place to read and watch, not a place to sign up. We collect as little as a website can reasonably collect, and this page says exactly what that means."
            updated="August 19, 2026"
            sections={sections}
        />
    );
}
