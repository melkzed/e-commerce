import { JsonLd } from "@/components/JsonLd";
import { LandingPage } from "@/components/LandingPage";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
  organizationJsonLd,
  serviceJsonLd,
  websiteJsonLd
} from "@/lib/seo";

const title = "Loja online com painel completo";
const description =
  "Venda online com uma plataforma para pedidos, estoque, clientes, pagamentos, relatórios, CRM, ERP, checkout e automações.";

export const metadata = createPageMetadata({
  title,
  description,
  path: "/"
});

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={serviceJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }])} />
      <LandingPage />
    </>
  );
}
