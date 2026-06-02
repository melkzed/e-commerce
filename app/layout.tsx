import type { Metadata } from "next";
import { PlatformNav } from "@/components/PlatformNav";
import { PlatformFooter } from "@/components/PlatformFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melkzedek Tech | Plataforma de Loja Online",
  description:
    "Plataforma para criar loja online, controlar pedidos, estoque, clientes, pagamentos e relatorios em um so lugar."
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
