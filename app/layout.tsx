import type { Metadata } from "next";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformNav } from "@/components/PlatformNav";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { siteConfig } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Plataforma de Loja Online`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "pt-BR": siteConfig.url
    }
  },
  openGraph: {
    title: `${siteConfig.name} | Plataforma de Loja Online`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: siteConfig.locale
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} | Plataforma de Loja Online`,
    description: siteConfig.description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    address: false,
    email: false,
    telephone: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Pular para o conteúdo
        </a>
        <PlatformNav />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <PlatformFooter />
        <WhatsAppFloat />
        <AccessibilityPanel />
      </body>
    </html>
  );
}
