"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  CloudCog,
  Command,
  DatabaseZap,
  Factory,
  Gauge,
  LockKeyhole,
  Network,
  PackageCheck,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Truck,
  UsersRound,
  Workflow,
  Zap
} from "lucide-react";
import { subscriptionPlans } from "@/lib/platform";

const platformMetrics = [
  { label: "Vendas acompanhadas", value: "R$ 482k", trend: "+18.4%" },
  { label: "Lojas ativas", value: "1.248", trend: "No controle" },
  { label: "Pedidos no mes", value: "86.310", trend: "+32%" },
  { label: "Sistema online", value: "99.98%", trend: "Em tempo real" }
];

const commandStats = [
  ["Vendas", "R$ 3.8M", "+22.8%"],
  ["Pedidos", "86.3k", "+16.1%"],
  ["Clientes", "12.4k", "+8.7%"],
  ["Estoque", "14.2k", "84% ok"]
];

const revenueBars = [42, 58, 51, 74, 69, 86, 93, 78, 98, 91, 104, 116];

const cockpitRows = [
  { store: "Aurora Market", plan: "Loja Completa", revenue: "R$ 418k", status: "Tudo ok" },
  { store: "Nexa Parts", plan: "Loja Profissional", revenue: "R$ 286k", status: "Atencao" },
  { store: "Vitta Farma", plan: "Loja Completa", revenue: "R$ 612k", status: "Tudo ok" },
  { store: "Forma Casa", plan: "Loja Essencial", revenue: "R$ 93k", status: "Crescendo" }
];

const enterpriseModules = [
  {
    icon: Boxes,
    title: "Loja online",
    text: "Produtos, carrinho, pedidos, cupons, vitrine e base para aparecer no Google."
  },
  {
    icon: Factory,
    title: "Controle da loja",
    text: "Estoque, fornecedores, compras, entradas, saidas e rotina diaria em um painel so."
  },
  {
    icon: UsersRound,
    title: "Clientes",
    text: "Historico de contato, interesse de compra, tarefas e acompanhamento de cada cliente."
  },
  {
    icon: CircleDollarSign,
    title: "Dinheiro",
    text: "Contas a receber, contas a pagar, fluxo de caixa e previsao do que vai entrar."
  },
  {
    icon: Truck,
    title: "Entregas",
    text: "Frete, rastreio, transportadoras e acompanhamento das entregas da loja."
  },
  {
    icon: BrainCircuit,
    title: "Relatorios",
    text: "Veja o que vende mais, o que esta parado e onde a loja pode melhorar."
  },
  {
    icon: Workflow,
    title: "Automacoes",
    text: "Mensagens, avisos de estoque, cobranca e campanhas para ganhar tempo."
  },
  {
    icon: ShieldCheck,
    title: "Seguranca",
    text: "Cada pessoa ve apenas o que precisa. Os dados ficam organizados e protegidos."
  }
];

const architecturePillars = [
  { icon: DatabaseZap, label: "Banco de dados", detail: "informacoes da loja bem organizadas" },
  { icon: LockKeyhole, label: "Permissoes", detail: "cada usuario com seu nivel de acesso" },
  { icon: RadioTower, label: "Tempo real", detail: "pedidos e avisos aparecem rapido" },
  { icon: CloudCog, label: "Automacoes", detail: "tarefas repetidas rodam sozinhas" },
  { icon: PackageCheck, label: "Arquivos", detail: "imagens e documentos em lugar seguro" },
  { icon: ClipboardList, label: "Historico", detail: "registro do que aconteceu no sistema" }
];

const masterHighlights = [
  "vendas, pedidos e clientes em um painel",
  "lojas que precisam de atencao",
  "uso do sistema e arquivos",
  "avisos importantes em tempo real"
];

const merchantHighlights = [
  "vendas do dia, mes e ticket medio",
  "pedidos atrasados e produtos sem estoque",
  "metas e comparativos simples",
  "lucro estimado e clientes que voltam"
];

function CommandCenterMockup() {
  return (
    <motion.div
      className="enterprise-console"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <div className="console-topbar">
        <div>
          <span>Command Center</span>
          <strong>Painel principal</strong>
        </div>
        <div className="console-live">
          <i />
          Online agora
        </div>
      </div>

      <div className="console-metrics">
        {commandStats.map(([label, value, trend]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{trend}</small>
          </div>
        ))}
      </div>

      <div className="console-main-grid">
        <div className="console-chart-panel">
          <div className="console-panel-head">
            <span>Vendas por mes</span>
            <strong>Ultimos meses</strong>
          </div>
          <div className="console-bars" aria-hidden="true">
            {revenueBars.map((height, index) => (
              <i key={`${height}-${index}`} style={{ height }} />
            ))}
          </div>
        </div>

        <div className="console-health-panel">
          <div className="console-panel-head">
            <span>Saude da loja</span>
            <strong>Tudo sob controle</strong>
          </div>
          {[
            ["Arquivos", "61%"],
            ["Dados", "48%"],
            ["Sistema", "73%"]
          ].map(([label, width]) => (
            <div className="health-line" key={label}>
              <span>{label}</span>
              <div>
                <i style={{ width }} />
              </div>
              <strong>{width}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="console-table">
        {cockpitRows.map((row) => (
          <div key={row.store}>
            <span>{row.store}</span>
            <small>{row.plan}</small>
            <strong>{row.revenue}</strong>
            <em>{row.status}</em>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function HighlightPanel({
  title,
  eyebrow,
  items,
  icon: Icon
}: {
  title: string;
  eyebrow: string;
  items: string[];
  icon: typeof BarChart3;
}) {
  return (
    <article className="dashboard-highlight">
      <div className="dashboard-highlight-head">
        <Icon size={22} />
        <div>
          <span>{eyebrow}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircle2 size={16} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 18 });
  const railX = useTransform(smoothX, [0, 1], [-20, 20]);
  const railY = useTransform(smoothY, [0, 1], [-12, 12]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  };

  return (
    <main className="landing-shell enterprise-landing" onPointerMove={handlePointerMove}>
      <section className="enterprise-hero">
        <div className="enterprise-grid-lines" aria-hidden="true" />
        <motion.div className="enterprise-motion-rails" style={{ x: railX, y: railY }} aria-hidden="true">
          <span />
          <span />
          <span />
        </motion.div>

        <div className="enterprise-hero-copy">
          <motion.p className="landing-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            Sistema completo para vender online
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            Venda online e controle sua loja em um so lugar.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            Uma plataforma para loja virtual, pedidos, estoque, clientes, pagamentos e relatorios.
            Voce acompanha tudo sem precisar entender termos tecnicos.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <a href="/orcamento" className="launch-cta">
              Pedir analise
              <ArrowRight size={18} />
            </a>
            <a href="#arquitetura" className="ghost-cta">
              Ver como funciona
            </a>
          </motion.div>
        </div>

        <CommandCenterMockup />

        <div className="enterprise-metric-strip">
          {platformMetrics.map((metric) => (
            <motion.div key={metric.label} whileHover={{ y: -4 }} transition={{ type: "spring", damping: 18 }}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.trend}</small>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="enterprise-section">
        <div className="section-kicker">
          <p className="landing-eyebrow">Tudo conectado</p>
          <h2>Mais que uma loja virtual: um painel para cuidar da venda inteira.</h2>
          <span>
            A loja vende, o painel organiza pedidos, o estoque avisa quando algo esta acabando
            e os relatorios mostram o que merece atencao.
          </span>
        </div>

        <div className="enterprise-module-grid">
          {enterpriseModules.map((item) => {
            const Icon = item.icon;

            return (
              <motion.article key={item.title} whileHover={{ y: -6 }}>
                <Icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="enterprise-split-section" id="arquitetura">
        <div className="section-kicker">
          <p className="landing-eyebrow">Base segura</p>
          <h2>Preparado para crescer sem baguncar os dados da loja.</h2>
          <span>
            Produtos, clientes, pedidos, pagamentos, imagens e usuarios ficam separados e
            organizados. Isso ajuda a loja crescer com seguranca.
          </span>
        </div>

        <div className="architecture-board neural-store-board">
          <svg className="neural-links" viewBox="0 0 100 100" aria-hidden="true">
            <line x1="50" y1="50" x2="22" y2="17" />
            <line x1="50" y1="50" x2="78" y2="17" />
            <line x1="50" y1="50" x2="22" y2="50" />
            <line x1="50" y1="50" x2="78" y2="50" />
            <line x1="50" y1="50" x2="22" y2="83" />
            <line x1="50" y1="50" x2="78" y2="83" />
            <circle cx="50" cy="50" r="12" />
            <circle cx="50" cy="50" r="22" />
            <circle cx="50" cy="50" r="32" />
            <circle cx="50" cy="50" r="42" />
          </svg>

          <div className="architecture-core neural-core">
            <Network size={26} />
            <strong>Loja</strong>
            <span>cada loja separada</span>
          </div>

          <div className="architecture-pillars neural-pillars">
            {architecturePillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <article key={pillar.label} className={`neural-card neural-card-${index + 1}`}>
                  <Icon size={20} />
                  <strong>{pillar.label}</strong>
                  <span>{pillar.detail}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="enterprise-section dashboards-section">
        <div className="section-kicker">
          <p className="landing-eyebrow">Paineis claros</p>
          <h2>O dono da loja entende rapido o que esta acontecendo.</h2>
        </div>

        <div className="dashboard-highlight-grid">
          <HighlightPanel
            eyebrow="Painel principal"
            title="Tudo que precisa de atencao"
            icon={Command}
            items={masterHighlights}
          />
          <HighlightPanel
            eyebrow="Painel da loja"
            title="Rotina diaria mais simples"
            icon={Gauge}
            items={merchantHighlights}
          />
        </div>
      </section>

      <section className="enterprise-timeline-section">
        <div className="section-kicker">
          <p className="landing-eyebrow">Planos simples</p>
          <h2>Comece pequeno e aumente quando a loja precisar.</h2>
        </div>

        <div className="enterprise-plan-row">
          {subscriptionPlans.map((plan, index) => (
            <motion.article key={plan.key} whileHover={{ y: -7 }}>
              <span>{`0${index + 1}`}</span>
              <strong>{plan.name}</strong>
              <p>{plan.idealFor}</p>
              <a href="/assinaturas">
                Ver cobertura
                <ArrowRight size={16} />
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="enterprise-final-cta">
        <div>
          <Sparkles size={22} />
          <p className="landing-eyebrow">Pronto para vender melhor</p>
          <h2>Monte uma loja com visual profissional e controle de verdade.</h2>
          <span>
            Responda algumas perguntas e receba uma sugestao clara do que sua loja precisa.
          </span>
        </div>

        <a href="/orcamento" className="launch-cta">
          Comecar pedido
          <Zap size={18} />
        </a>
      </section>
    </main>
  );
}
