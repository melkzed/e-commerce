import { JsonLd } from "@/components/JsonLd";
import { PlansPage } from "@/components/PlansPage";
import { breadcrumbJsonLd, createPageMetadata, serviceJsonLd, webPageJsonLd } from "@/lib/seo";

const title = "Planos de assinatura";
const description =
  "Compare os planos Loja Essencial, Loja Profissional e Loja Completa para escolher a estrutura ideal da sua loja online.";

export const metadata = createPageMetadata({
  title,
  description,
  path: "/assinaturas"
});

export default function AssinaturasPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd()} />
      <JsonLd
        data={webPageJsonLd({
          name: title,
          description,
          path: "/assinaturas"
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Planos de assinatura", path: "/assinaturas" }
        ])}
      />
      <PlansPage />
    </>
  );
}
