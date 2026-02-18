import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { config } from "@/lib/config";

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
      <body style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
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

