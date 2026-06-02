"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  CreditCard, 
  User, 
  Settings,
  Sparkles 
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orcamento", label: "Pedidos", icon: FileText },
  { href: "/assinaturas", label: "Planos", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/admin", label: "Admin", icon: Settings }
];

export function PlatformNav({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const pathname = usePathname();

  return (
    <header className={clsx("platform-nav", variant)}>
      <a className="platform-brand" href="/">
        <span>MT</span>
        <div>
          <strong>Melkzedek Tech</strong>
          <small>Plataforma Pro</small>
        </div>
      </a>

      <nav aria-label="Principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <a 
              key={item.href} 
              className={clsx(active && "active")} 
              href={item.href}
              title={item.label}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="hidden sm:inline">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
