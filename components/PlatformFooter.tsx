import {
  Home,
  FileText,
  CreditCard,
  User,
  Mail,
  ShieldCheck,
  Globe
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orcamento", label: "Pedidos", icon: FileText },
  { href: "/assinaturas", label: "Planos", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: User }
];

const legalLinks = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de uso" }
];

export function PlatformFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="platform-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">MT</div>
            <div className="footer-logo-text">
              <strong>Melkzedek Tech</strong>
              <small>Plataforma Pro</small>
            </div>
          </div>

          <p className="footer-tagline">
            Sistema completo para loja virtual, pedidos, estoque, clientes e pagamentos em um so lugar.
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

        {/* Servicos */}
        <div className="footer-col">
          <span className="footer-col-label">Servicos</span>
          <nav>
            <a href="/orcamento">Solicitar analise</a>
            <a href="/assinaturas">Ver planos</a>
            <a href="/perfil">Minha conta</a>
            <a href="/admin">Painel admin</a>
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
          <span>(c) {currentYear} Melkzedek Tech - Todos os direitos reservados.</span>
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
