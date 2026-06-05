"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  CreditCard, 
  User, 
  Settings,
  Headphones
} from "lucide-react";
import { usePlatformAuth } from "@/components/usePlatformAuth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orcamento", label: "Orçamento", icon: FileText },
  { href: "/assinaturas", label: "Planos", icon: CreditCard },
  { href: "/suporte", label: "Suporte", icon: Headphones },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/admin", label: "Admin", icon: Settings, adminOnly: true }
];

export function PlatformNav({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const pathname = usePathname();
  const auth = usePlatformAuth();

  return (
    <header className={clsx("platform-nav", variant)}>
      <a className="platform-brand" href="/" aria-label="Melk Zedek Tech, página inicial">
        <img className="platform-brand-mark" src="/brand/melk-zedek-mark-transparent.png" alt="" aria-hidden="true" />
        <div>
          <strong>Melk Zedek Tech</strong>
          <small>Tecnologia para negócios</small>
        </div>
      </a>

      <nav aria-label="Principal">
        {navItems.filter((item) => !item.adminOnly || auth.isAdmin).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <a 
              key={item.href} 
              className={clsx(active && "active")} 
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
