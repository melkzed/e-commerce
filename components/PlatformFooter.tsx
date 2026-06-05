"use client";

import {
  Home,
  FileText,
  CreditCard,
  User,
  Headphones,
  Mail,
  ShieldCheck,
  Globe
} from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orcamento", label: "Orçamento", icon: FileText },
  { href: "/assinaturas", label: "Planos", icon: CreditCard },
  { href: "/suporte", label: "Suporte", icon: Headphones },
  { href: "/perfil", label: "Perfil", icon: User }
];

const legalLinks = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de uso" }
];

export function PlatformFooter() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="platform-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img
              className="footer-logo-full"
              src="/brand/melk-zedek-logo-transparent.png"
              alt="Melk Zedek Tech - Tecnologia que impulsiona negócios"
            />
          </div>

          <p className="footer-tagline">
            Sistema completo para loja virtual, pedidos, estoque, clientes e pagamentos em um só lugar.
          </p>

          <div className="footer-badge">
            <i />
            Sistema online agora
          </div>
        </div>

        {/* Navegacao */}
        <div className="footer-col">
          <span className="footer-col-label">Plataforma</span>
          <nav>
            {navLinks.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Serviços */}
        <div className="footer-col">
          <span className="footer-col-label">Serviços</span>
          <nav>
            <a href="/orcamento">Solicitar orçamento</a>
            <a href="/assinaturas">Ver planos</a>
            <a href="/suporte">Suporte</a>
            <a href="/perfil">Minha conta</a>
          </nav>
        </div>

        {/* Contato */}
        <div className="footer-contact-col">
          <span className="footer-col-label">Contato</span>

          <a href="mailto:melkzedd@gmail.com" className="footer-contact-item">
            <Mail size={16} strokeWidth={2} />
            <span>melkzedd@gmail.com</span>
          </a>

          <div className="footer-contact-item">
            <ShieldCheck size={16} strokeWidth={2} />
            <span>Dados protegidos</span>
          </div>

          <div className="footer-contact-item">
            <Globe size={16} strokeWidth={2} />
            <span>Recife, Pernambuco</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span>© {currentYear} Melkzedek Tech - Todos os direitos reservados.</span>
        </div>

        <div className="footer-bottom-right">
          {legalLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
