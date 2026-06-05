import { JsonLd } from "@/components/JsonLd";
import { SupportPage } from "@/components/SupportPage";
import { breadcrumbJsonLd, createPageMetadata, webPageJsonLd } from "@/lib/seo";

const title = "Suporte";
const description = "Área para abrir tickets, acompanhar respostas e avaliar o atendimento.";

export const metadata = createPageMetadata({
  title,
  description,
  path: "/suporte"
});

export default function SuportePage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          type: "ContactPage",
          name: title,
          description,
          path: "/suporte"
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Suporte", path: "/suporte" }
        ])}
      />
      <SupportPage />
    </>
  );
}
