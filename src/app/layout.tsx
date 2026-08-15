import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { config } from "@/lib/config";
import { GoogleTagManager } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: config.app.fullName,
  description: config.app.description,
};

import { SettingsProvider } from "@/context/SettingsContext";
import { SettingsModal } from "@/components/common/SettingsModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d='${config.app.defaultTheme}';var t=d;try{var s=localStorage.getItem('theme');if(s==='light'||s==='dark'||s==='white')t=s}catch(e){}var r=document.documentElement;r.setAttribute('data-theme',t==='white'?'light':t);if(t==='white')r.setAttribute('data-theme-variant','white')})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {config.app.gtmId && <GoogleTagManager gtmId={config.app.gtmId} />}
        <SettingsProvider>
          <Header />
          <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            {children}
          </main>
          <Footer />
          <SettingsModal />
        </SettingsProvider>
      </body>
    </html>
  );
}

