import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melkzedek Tech | Plataforma de Lojas Online",
  description:
    "Plataforma SaaS para assinatura de lojas online, orcamentos guiados, perfil do cliente, emails e painel administrativo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
