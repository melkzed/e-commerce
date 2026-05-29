"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Bot, LayoutDashboard, UserRound, WalletCards } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: ArrowUpRight },
  { href: "/orcamento", label: "Orcamento", icon: Bot },
  { href: "/assinaturas", label: "Assinaturas", icon: WalletCards },
  { href: "/perfil", label: "Perfil", icon: UserRound },
  { href: "/admin", label: "Admin", icon: LayoutDashboard }
];

export function PlatformNav({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const pathname = usePathname();

  return (
    <header className={clsx("platform-nav", variant)}>
      <a className="platform-brand" href="/">
        <span>M</span>
        <div>
          <strong>Melkzedek Tech</strong>
          <small>Store OS</small>
        </div>
      </a>

      <nav aria-label="Principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <a key={item.href} className={clsx(active && "active")} href={item.href}>
              <Icon size={15} />
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
