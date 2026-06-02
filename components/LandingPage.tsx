"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChartNetwork,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  CloudCog,
  Command,
  CreditCard,
  DatabaseZap,
  Factory,
  Gauge,
  LockKeyhole,
  Network,
  PackageCheck,
  PlugZap,
  RadioTower,
  Rocket,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Truck,
  UsersRound,
  Workflow,
  Zap
} from "lucide-react";
import { subscriptionPlans } from "@/lib/platform";

const platformMetrics = [
  { label: "ROI estimado", value: "4.6x", trend: "em 90 dias" },
  { label: "Economia mensal", value: "42h", trend: "com automacoes" },
  { label: "Vendas recuperadas", value: "R$ 18.4k", trend: "carrinho + CRM" },
  { label: "Suporte e uptime", value: "99.98%", trend: "operacao online" }
];

const commandStats = [
  ["ROI", "4.6x", "estimado"],
  ["Recuperado", "R$ 18.4k", "carrinho"],
  ["Tempo salvo", "42h", "por mes"],
  ["Conversao", "+28%", "checkout"]
];

const revenueBars = [38, 45, 52, 58, 64, 72, 79, 88, 96, 106, 118, 132];

const cockpitRows = [
  { store: "Checkout + Pix", plan: "Conversao", revenue: "+28%", status: "Ativar" },
  { store: "Carrinho abandonado", plan: "Automacao", revenue: "R$ 18.4k", status: "Recuperar" },
  { store: "CRM de recompra", plan: "Retencao", revenue: "+312 leads", status: "Engajar" },
  { store: "Plano recomendado", plan: "Loja Completa", revenue: "4.6x ROI", status: "Assinar" }
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
  },
  {
    icon: ShoppingCart,
    title: "Checkout otimizado",
    text: "Fluxo de compra com menos atrito, recuperacao de carrinho e conversao mais alta."
  },
  {
    icon: CreditCard,
    title: "Gateway de pagamento",
    text: "Pix, cartao, boleto, split de pagamento e conciliacao financeira em um so fluxo."
  },
  {
    icon: ChartNetwork,
    title: "CRM comercial",
    text: "Funil de vendas, leads, follow-up, segmentacao e historico completo do cliente."
  },
  {
    icon: ServerCog,
    title: "ERP integrado",
    text: "Pedidos, estoque, financeiro, notas e operacao conectados sem retrabalho manual."
  },
  {
    icon: ClipboardList,
    title: "OMS de pedidos",
    text: "Gestao do ciclo do pedido: recebido, separado, faturado, enviado e entregue."
  },
  {
    icon: ChartNoAxesCombined,
    title: "BI e analytics",
    text: "Indicadores, cohort, ticket medio, LTV, CAC e margem para decisoes mais precisas."
  },
  {
    icon: SearchCheck,
    title: "SEO tecnico",
    text: "URLs limpas, performance, metadados, schema e base preparada para trafego organico."
  },
  {
    icon: PlugZap,
    title: "API e webhooks",
    text: "Integracoes com marketplaces, ERPs, automacoes, WhatsApp e sistemas externos."
  },
  {
    icon: Rocket,
    title: "Core Web Vitals",
    text: "Performance, estabilidade visual e carregamento rapido para melhorar experiencia."
  },
  {
    icon: Gauge,
    title: "SLA e monitoramento",
    text: "Alertas, logs, uptime e acompanhamento tecnico para manter a operacao no ar."
  }
];

const proofMetrics = [
  {
    value: "4.6x",
    label: "ROI estimado",
    text: "Projecao para lojas que ativam checkout, carrinho recuperado, CRM e campanhas."
  },
  {
    value: "+28%",
    label: "mais conversao",
    text: "Fluxo de compra com menos atrito, Pix, cartao e chamadas claras para finalizar pedido."
  },
  {
    value: "R$ 18.4k",
    label: "em vendas recuperadas",
    text: "Automacoes para lembrar clientes, recuperar carrinhos e puxar recompra."
  },
  {
    value: "42h",
    label: "economizadas por mes",
    text: "Rotinas repetidas deixam de consumir tempo da equipe e ficam no painel."
  }
];

const trustSignals = [
  {
    icon: CreditCard,
    title: "Checkout preparado",
    text: "Pagamento online, Pix, cartao, boleto e base para conciliacao financeira."
  },
  {
    icon: ChartNoAxesCombined,
    title: "Decisao por dados",
    text: "Ticket medio, conversao, LTV, CAC, margem e produtos com melhor desempenho."
  },
  {
    icon: PlugZap,
    title: "Integracoes",
    text: "API, webhooks, WhatsApp, ERP, marketplaces e automacoes quando a loja crescer."
  },
  {
    icon: ShieldCheck,
    title: "Operacao protegida",
    text: "Permissoes por usuario, historico, backup, monitoramento e separacao por loja."
  }
];

const faqItems = [
  {
    question: "Preciso entender tecnologia para usar?",
    answer: "Nao. A proposta e entregar um painel claro para produtos, pedidos, clientes e dinheiro sem depender de termos tecnicos."
  },
  {
    question: "Qual plano eu devo assinar?",
    answer: "O pedido guiado cruza catalogo, prazo, recursos e nivel da operacao para sugerir o plano mais coerente."
  },
  {
    question: "A plataforma serve para loja pequena?",
    answer: "Sim. Voce pode comecar com uma estrutura menor e evoluir para recursos de CRM, ERP, automacoes e relatorios."
  },
  {
    question: "Consigo acompanhar resultado?",
    answer: "Sim. A ideia e mostrar vendas, conversao, carrinhos, estoque, clientes e proximas acoes em paineis simples."
  },
  {
    question: "Meus dados ficam separados?",
    answer: "Sim. A arquitetura separa cada loja, usuarios, permissoes, arquivos e historico para reduzir bagunca operacional."
  },
  {
    question: "Posso integrar outros sistemas depois?",
    answer: "Sim. Os planos maiores ja consideram API, webhooks e integracoes para conectar a operacao com sistemas externos."
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

const architectureSatellites = [
  { icon: UsersRound, label: "Usuarios", detail: "acesso seguro e personalizado" },
  { icon: Smartphone, label: "Dispositivos", detail: "acesso de onde estiver" },
  { icon: BellRing, label: "Notificacoes", detail: "alertas inteligentes e automaticos" },
  { icon: BarChart3, label: "Relatorios", detail: "decisoes com dados reais" }
];

const architectureLinks = [
  { id: "store-database", kind: "primary", d: "M600 380 L357 240", duration: "2.4s", delay: "0s" },
  { id: "store-permissions", kind: "primary", d: "M600 380 L600 100", duration: "2.1s", delay: "0.2s" },
  { id: "store-realtime", kind: "primary", d: "M600 380 L843 240", duration: "2.4s", delay: "0.4s" },
  { id: "store-history", kind: "primary", d: "M600 380 L843 520", duration: "2.35s", delay: "0.6s" },
  { id: "store-files", kind: "primary", d: "M600 380 L600 660", duration: "2.1s", delay: "0.8s" },
  { id: "store-automation", kind: "primary", d: "M600 380 L357 520", duration: "2.35s", delay: "1s" },
  { id: "database-permissions", kind: "ring", d: "M357 240 C430 122 520 96 600 100", duration: "3s", delay: "0.1s" },
  { id: "permissions-realtime", kind: "ring", d: "M600 100 C680 96 770 122 843 240", duration: "3s", delay: "0.35s" },
  { id: "realtime-history", kind: "ring", d: "M843 240 C945 304 945 456 843 520", duration: "3.3s", delay: "0.6s" },
  { id: "history-files", kind: "ring", d: "M843 520 C770 638 680 664 600 660", duration: "3s", delay: "0.85s" },
  { id: "files-automation", kind: "ring", d: "M600 660 C520 664 430 638 357 520", duration: "3s", delay: "1.1s" },
  { id: "automation-database", kind: "ring", d: "M357 520 C255 456 255 304 357 240", duration: "3.3s", delay: "1.35s" },
  { id: "database-users", kind: "outer", d: "M357 240 C252 248 178 280 130 300", duration: "2.7s", delay: "0.2s" },
  { id: "automation-devices", kind: "outer", d: "M357 520 C252 512 178 480 130 460", duration: "2.7s", delay: "0.55s" },
  { id: "realtime-notifications", kind: "outer", d: "M843 240 C948 248 1022 280 1070 300", duration: "2.7s", delay: "0.35s" },
  { id: "history-reports", kind: "outer", d: "M843 520 C948 512 1022 480 1070 460", duration: "2.7s", delay: "0.7s" },
  { id: "users-devices", kind: "outer", d: "M130 300 C96 348 96 412 130 460", duration: "3.2s", delay: "0.95s" },
  { id: "notifications-reports", kind: "outer", d: "M1070 300 C1104 348 1104 412 1070 460", duration: "3.2s", delay: "1.2s" }
];

const architectureNodes = [
  { id: "store", x: 600, y: 380, r: 6 },
  { id: "database", x: 357, y: 240, r: 6 },
  { id: "permissions", x: 600, y: 100, r: 6 },
  { id: "realtime", x: 843, y: 240, r: 6 },
  { id: "history", x: 843, y: 520, r: 6 },
  { id: "files", x: 600, y: 660, r: 6 },
  { id: "automation", x: 357, y: 520, r: 6 },
  { id: "users", x: 130, y: 300, r: 5 },
  { id: "devices", x: 130, y: 460, r: 5 },
  { id: "notifications", x: 1070, y: 300, r: 5 },
  { id: "reports", x: 1070, y: 460, r: 5 }
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
          <span>Plano recomendado</span>
          <strong>Loja Completa</strong>
        </div>
        <div className="console-live">
          <i />
          Pronto para assinar
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
            <span>Projecao de crescimento</span>
            <strong>Proximos 90 dias</strong>
          </div>
          <div className="console-bars" aria-hidden="true">
            {revenueBars.map((height, index) => (
              <i key={`${height}-${index}`} style={{ height }} />
            ))}
          </div>
        </div>

        <div className="console-health-panel">
          <div className="console-panel-head">
            <span>Impacto da assinatura</span>
            <strong>Ganhos mais rapidos</strong>
          </div>
          {[
            ["Conversao", "82%"],
            ["Automacao", "76%"],
            ["Retencao", "68%"]
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

      <section className="enterprise-section proof-section">
        <div className="section-kicker">
          <p className="landing-eyebrow">Motivos para assinar</p>
          <h2>Uma plataforma pensada para vender mais e operar com menos retrabalho.</h2>
          <span>
            O painel mostra potencial de retorno, gargalos da loja e os recursos que
            deixam a operacao pronta para crescer com controle.
          </span>
        </div>

        <div className="proof-metric-grid">
          {proofMetrics.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="proof-signal-grid">
          {trustSignals.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title}>
                <Icon size={24} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
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
          <svg className="neural-links" viewBox="0 0 1200 760" aria-hidden="true">
            <defs>
              <linearGradient id="webLine" x1="130" y1="100" x2="1070" y2="660" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#38bdf8" stopOpacity="0.62" />
                <stop offset="0.52" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="1" stopColor="#c026d3" stopOpacity="0.7" />
              </linearGradient>
              <filter id="webGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {architectureLinks.map((link) => (
              <path
                key={`${link.id}-base`}
                className={`web-link-base web-link-${link.kind}`}
                d={link.d}
              />
            ))}

            {architectureLinks.map((link) => (
              <path
                key={`${link.id}-flow`}
                className={`web-link-flow web-link-${link.kind}`}
                d={link.d}
                style={{ animationDelay: link.delay, animationDuration: link.duration }}
              />
            ))}

            <g className="web-energy-pulses">
              {architectureLinks.map((link) => (
                <circle key={`${link.id}-pulse`} className={`web-runner web-runner-${link.kind}`} r={link.kind === "primary" ? 5 : 4}>
                  <animateMotion dur={link.duration} repeatCount="indefinite" path={link.d} begin={link.delay} />
                </circle>
              ))}
            </g>

            {architectureNodes.map((node) => (
              <circle key={node.id} className="web-dot" cx={node.x} cy={node.y} r={node.r} />
            ))}
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

          <div className="architecture-satellites">
            {architectureSatellites.map((item, index) => {
              const Icon = item.icon;

              return (
                <article key={item.label} className={`neural-satellite neural-satellite-${index + 1}`}>
                  <span>
                    <Icon size={22} />
                  </span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
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

      <section className="enterprise-section faq-section">
        <div className="section-kicker">
          <p className="landing-eyebrow">Duvidas comuns</p>
          <h2>Respostas rapidas para decidir com mais seguranca.</h2>
          <span>
            Antes de pedir a analise, veja como a plataforma ajuda no comeco,
            no crescimento e na organizacao da loja.
          </span>
        </div>

        <div className="faq-grid">
          {faqItems.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="enterprise-final-cta">
        <div>
          <Sparkles size={22} />
          <p className="landing-eyebrow">Pronto para vender melhor</p>
          <h2>Descubra o plano ideal antes de assinar.</h2>
          <span>
            Responda algumas perguntas e receba uma sugestao clara com recursos,
            prioridade e caminho de crescimento para sua loja.
          </span>
        </div>

        <a href="/orcamento" className="launch-cta">
          Pedir analise agora
          <Zap size={18} />
        </a>
      </section>
    </main>
  );
}
