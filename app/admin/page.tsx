import { AdminPage } from "@/components/AdminPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "Painel administrativo para acompanhar orçamentos de análise.",
  path: "/admin",
  noIndex: true
});

export default function AdminRoutePage() {
  return <AdminPage />;
}
