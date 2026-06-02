import type { Metadata } from "next";
import { QuotePage } from "@/components/QuotePage";

export const metadata: Metadata = {
  title: "Pedido de analise",
  description:
    "Responda perguntas simples e receba uma sugestao de plano para montar sua loja online com a estrutura certa."
};

export default function OrcamentoPage() {
  return <QuotePage />;
}
