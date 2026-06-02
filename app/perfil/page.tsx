import type { Metadata } from "next";
import { ProfilePage } from "@/components/ProfilePage";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Complete seus dados para solicitar uma analise da sua loja online.",
  robots: {
    index: false,
    follow: false
  }
};

export default function PerfilPage() {
  return <ProfilePage />;
}
