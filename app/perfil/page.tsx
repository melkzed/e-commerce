import { ProfilePage } from "@/components/ProfilePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Perfil",
  description: "Complete seus dados para solicitar uma análise da sua loja online.",
  path: "/perfil",
  noIndex: true
});

export default function PerfilPage() {
  return <ProfilePage />;
}
