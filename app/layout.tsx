import type { Metadata } from "next";
import { PlatformNav } from "@/components/PlatformNav";
import { PlatformFooter } from "@/components/PlatformFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Melkzedek Tech | Plataforma de Loja Online",
    template: "%s | Melkzedek Tech"
  },
  description:
    "Plataforma para criar loja online, controlar pedidos, estoque, clientes, pagamentos, relatorios e automacoes em um so lugar.",
  applicationName: "Melkzedek Tech",
  keywords: [
    "loja virtual",
    "e-commerce",
    "plataforma de loja online",
    "controle de pedidos",
    "estoque",
    "CRM",
    "ERP",
    "checkout"
  ],
  openGraph: {
    title: "Melkzedek Tech | Plataforma de Loja Online",
    description:
      "Venda online com loja virtual, pedidos, estoque, clientes, pagamentos, relatorios e automacoes em um so lugar.",
    type: "website",
    locale: "pt_BR"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <PlatformNav />
        {children}
        <PlatformFooter />
      </body>
    </html>
  );
}
