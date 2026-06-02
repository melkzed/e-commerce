import type { Metadata } from "next";
import { PlansPage } from "@/components/PlansPage";

export const metadata: Metadata = {
  title: "Planos de assinatura",
  description:
    "Compare os planos Loja Essencial, Loja Profissional e Loja Completa para escolher a estrutura ideal da sua loja online."
};

export default function AssinaturasPage() {
  return <PlansPage />;
}
