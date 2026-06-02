import { 
  Home, 
  FileText, 
  CreditCard, 
  User, 
  Mail, 
  Lock,
  Heart
} from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/orcamento", label: "Pedidos" },
  { href: "/assinaturas", label: "Planos" },
  { href: "/perfil", label: "Perfil" }
];

export function PlatformFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="platform-footer">
      <div className="footer-brand-block">
        <span>✨</span>
        <div>
          <strong>Melkzedek Tech</strong>
          <p>Plataforma completa para gerenciar sua loja online, pedidos, estoque, clientes e pagamentos em um só lugar.</p>
        </div>
      </div>

      <nav aria-label="Navegação">
        {footerLinks.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="footer-contact">
        <a href="mailto:melkzedd@gmail.com" title="Email de contato">
          <Mail size={18} strokeWidth={2} />
          melkzedd@gmail.com
        </a>
        <span>
          <Lock size={18} strokeWidth={2} />
          Segurança garantida
        </span>
        <div style={{ 
          fontSize: '0.85rem', 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid rgba(167, 139, 250, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px'
        }}>
          © {currentYear} Melkzedek Tech
        </div>
      </div>
    </footer>
  );
}
