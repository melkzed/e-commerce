import type { MetadataRoute, Metadata } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const siteConfig = {
  name: "Melkzedek Tech",
  shortName: "Melkzedek Tech",
  url: siteUrl,
  locale: "pt_BR",
  language: "pt-BR",
  email: "melkzedd@gmail.com",
  description:
    "Plataforma para criar loja online, controlar pedidos, estoque, clientes, pagamentos, relatórios e automações em um só lugar.",
  keywords: [
    "loja virtual",
    "e-commerce",
    "plataforma de loja online",
    "criação de loja online",
    "sistema para loja virtual",
    "controle de pedidos",
    "controle de estoque",
    "CRM",
    "ERP",
    "checkout",
    "relatórios de vendas",
    "automação de e-commerce"
  ]
};

export const publicRoutes: MetadataRoute.Sitemap = [
  {
    url: `${siteConfig.url}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1
  },
  {
    url: `${siteConfig.url}/assinaturas`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9
  },
  {
    url: `${siteConfig.url}/orcamento`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.85
  },
  {
    url: `${siteConfig.url}/suporte`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7
  },
  {
    url: `${siteConfig.url}/privacidade`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.35
  },
  {
    url: `${siteConfig.url}/termos`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.35
  }
];

export const homeFaq = [
  {
    question: "Preciso entender tecnologia para usar?",
    answer:
      "Não. A proposta é entregar um painel claro para produtos, pedidos, clientes e dinheiro sem depender de termos técnicos."
  },
  {
    question: "Qual plano eu devo assinar?",
    answer:
      "O orçamento guiado cruza catálogo, prazo, recursos e nível da operação para sugerir o plano mais coerente."
  },
  {
    question: "A plataforma serve para loja pequena?",
    answer:
      "Sim. Você pode começar com uma estrutura menor e evoluir para recursos de CRM, ERP, automações e relatórios."
  },
  {
    question: "Consigo acompanhar resultado?",
    answer:
      "Sim. A ideia é mostrar vendas, conversão, carrinhos, estoque, clientes e próximas ações em painéis simples."
  }
];

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata({
  description,
  noIndex = false,
  path,
  title
}: {
  description: string;
  noIndex?: boolean;
  path: string;
  title: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    keywords: siteConfig.keywords,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `${title} | ${siteConfig.name}`,
      description
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    email: siteConfig.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.email,
        availableLanguage: ["pt-BR"]
      }
    ]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name
    }
  };
}

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plataforma de loja online",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url
    },
    areaServed: {
      "@type": "Country",
      name: "Brasil"
    },
    serviceType: "Criação e gestão de loja online",
    description:
      "Sistema para loja virtual com pedidos, estoque, clientes, pagamentos, relatórios, suporte e automações."
  };
}

export function faqJsonLd(items = homeFaq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function webPageJsonLd({
  description,
  name,
  path,
  type = "WebPage"
}: {
  description: string;
  name: string;
  path: string;
  type?: "AboutPage" | "ContactPage" | "WebPage";
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: siteConfig.language,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url
    }
  };
}
