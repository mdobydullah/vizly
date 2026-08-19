import LegalPage, { LegalSection } from "@/components/common/LegalPage";
import { config } from "@/lib/config";

const linkStyle = { color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 };

const sections: LegalSection[] = [
    {
        title: "Using Vizly",
        body: (
            <>
                Vizly is free to read and watch. There is no account to create and no subscription
                to buy. By using the site you accept these terms. If you disagree with any part of
                them, the remedy is simple, which is to stop using the site.
            </>
        ),
    },
    {
        title: "What the content is for",
        body: (
            <>
                Everything here is educational material about software engineering concepts. It is
                written to help you understand and remember ideas, and to prepare for technical
                interviews. It is not professional advice, and it is not a guarantee that any
                approach shown is correct for your particular system, your data or your production
                environment. Verify anything you plan to rely on.
            </>
        ),
    },
    {
        title: "Accuracy and availability",
        body: (
            <>
                Technical subjects change, and explanations that were accurate when written can
                drift out of date. We correct mistakes when we find them, but we make no promise
                that the content is complete, current or free of errors. We also make no promise
                that the site stays online or that any page or video remains available.
            </>
        ),
    },
    {
        title: "Content and intellectual property",
        body: (
            <>
                The articles, guides, animations and videos on Vizly are the work of the project
                and its contributors. You are welcome to read them, share links to them and use
                what you learn in your own work. Republishing substantial portions as your own,
                or redistributing the videos as your own content, is not permitted without
                permission. The source code is public in the{" "}
                <a href={config.urls.githubRepo} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Vizly repository
                </a>
                , and any code reuse is governed by the terms stated there.
            </>
        ),
    },
    {
        title: "Trademarks and third party names",
        body: (
            <>
                Technologies, companies and products referred to on Vizly, such as databases,
                protocols and cloud services, are named for identification and education only.
                Their trademarks belong to their respective owners, and their appearance here
                does not imply any affiliation with or endorsement by them.
            </>
        ),
    },
    {
        title: "External links and platforms",
        body: (
            <>
                Vizly links to external resources and publishes videos on platforms including
                YouTube, Instagram, TikTok and Facebook. We do not control those services and we
                are not responsible for their content, their availability or their terms. Your use
                of them is governed by their own agreements.
            </>
        ),
    },
    {
        title: "Acceptable use",
        body: (
            <>
                Please do not attempt to disrupt the site, break its security, scrape it in a way
                that degrades service for others, or use it for anything unlawful. We may block
                access that threatens the availability or integrity of the site.
            </>
        ),
    },
    {
        title: "Limitation of liability",
        body: (
            <>
                Vizly is provided as is, without warranties of any kind. To the fullest extent
                permitted by law, the project and its maintainer are not liable for any loss or
                damage arising from your use of the site or from reliance on its content,
                including any damage to systems, data or business.
            </>
        ),
    },
    {
        title: "Changes to these terms",
        body: (
            <>
                These terms may be updated as the project grows. The date at the top of this page
                reflects the latest version, and the edit history is public in the repository.
                Continuing to use Vizly after a change means you accept the updated terms.
            </>
        ),
    },
    {
        title: "Contact",
        body: (
            <>
                Questions about these terms can be raised as an issue on the{" "}
                <a href={config.urls.githubRepo} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Vizly GitHub repository
                </a>
                , or sent through{" "}
                <a href="https://obydul.me" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    obydul.me
                </a>
                . See also our{" "}
                <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a>.
            </>
        ),
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="✦ Terms"
            title="Terms of Use"
            intro="Vizly is free educational material about software engineering. These terms explain what you can expect from the site and what we ask of you in return."
            updated="August 19, 2026"
            sections={sections}
        />
    );
}
