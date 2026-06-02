import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Loja online com painel completo",
  description:
    "Venda online com uma plataforma para pedidos, estoque, clientes, pagamentos, relatorios, CRM, ERP, checkout e automacoes."
};

export default function Home() {
  return <LandingPage />;
}
