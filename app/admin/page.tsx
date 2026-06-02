import type { Metadata } from "next";
import { AdminPage } from "@/components/AdminPage";

export const metadata: Metadata = {
  title: "Admin",
  description: "Painel administrativo para acompanhar pedidos de analise.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminRoutePage() {
  return <AdminPage />;
}
