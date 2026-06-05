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
  { label: "Economia mensal", value: "42h", trend: "com automações" },
    { label: "Vendas recuperadas", value: "R$ 18.400", trend: "carrinho + CRM" },
  { label: "Suporte e uptime", value: "99.98%", trend: "operação online" }
];

const commandStats = [
  ["ROI", "4.6x", "estimado"],
    ["Recuperado", "R$ 18.400", "carrinho"],
  ["Tempo salvo", "42h", "por mês"],
  ["Conversão", "+28%", "checkout"]
];

const revenueBars = [38, 45, 52, 58, 64, 72, 79, 88, 96, 106, 118, 132];

const cockpitRows = [
  { store: "Checkout + Pix", plan: "Conversão", revenue: "+28%", status: "Ativar" },
    { store: "Carrinho abandonado", plan: "Automação", revenue: "R$ 18.400", status: "Recuperar" },
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
    text: "Estoque, fornecedores, compras, entradas, saídas e rotina diária em um painel só."
  },
  {
    icon: UsersRound,
    title: "Clientes",
    text: "Histórico de contato, interesse de compra, tarefas e acompanhamento de cada cliente."
  },
  {
    icon: CircleDollarSign,
    title: "Dinheiro",
    text: "Contas a receber, contas a pagar, fluxo de caixa e previsão do que vai entrar."
  },
  {
    icon: Truck,
    title: "Entregas",
    text: "Frete, rastreio, transportadoras e acompanhamento das entregas da loja."
  },
  {
    icon: BrainCircuit,
    title: "Relatórios",
    text: "Veja o que vende mais, o que está parado e onde a loja pode melhorar."
  },
  {
    icon: Workflow,
    title: "Automações",
    text: "Mensagens, avisos de estoque, cobrança e campanhas para ganhar tempo."
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    text: "Cada pessoa vê apenas o que precisa. Os dados ficam organizados e protegidos."
  },
  {
    icon: ShoppingCart,
    title: "Checkout otimizado",
    text: "Fluxo de compra com menos atrito, recuperação de carrinho e conversão mais alta."
  },
  {
    icon: ChartNetwork,
    title: "CRM comercial",
    text: "Funil de vendas, leads, follow-up, segmentação e histórico completo do cliente."
  },
  {
    icon: ServerCog,
    title: "ERP integrado",
    text: "Pedidos, estoque, financeiro, notas e operação conectados sem retrabalho manual."
  },
  {
    icon: ClipboardList,
    title: "OMS de pedidos",
    text: "Gestão do ciclo do pedido: recebido, separado, faturado, enviado e entregue."
  },
  {
    icon: ChartNoAxesCombined,
    title: "BI e analytics",
    text: "Indicadores, cohort, ticket médio, LTV, CAC e margem para decisões mais precisas."
  },
  {
    icon: SearchCheck,
    title: "SEO técnico",
    text: "URLs limpas, performance, metadados, schema e base preparada para tráfego orgânico."
  },
  {
    icon: Gauge,
    title: "SLA e monitoramento",
    text: "Alertas, logs, uptime e acompanhamento técnico para manter a operação no ar."
  }
];

const proofMetrics = [
  {
    value: "4.6x",
    label: "retorno planejado",
    text: "A assinatura ajuda a transformar a loja em uma operação mensurável: cada recurso entra com objetivo claro, como vender mais, recuperar pedidos ou reduzir retrabalho."
  },
  {
    value: "+28%",
    label: "compra mais simples",
    text: "O cliente encontra o produto, entende o pedido e finaliza a compra com menos etapas. Checkout, Pix, cartão e chamadas diretas reduzem abandono."
  },
  {
    value: "R$ 18.400",
    label: "oportunidades recuperadas",
    text: "Carrinhos abandonados, clientes indecisos e recompras deixam de ficar esquecidos. A plataforma cria pontos de contato para trazer o cliente de volta."
  },
  {
    value: "42h",
    label: "menos trabalho manual",
    text: "Pedidos, estoque, clientes, suporte e relatórios ficam organizados em um só painel, diminuindo planilhas, mensagens soltas e conferências repetidas."
  }
];

const trustSignals = [
  {
    icon: CreditCard,
    title: "Venda com pagamento organizado",
    text: "A loja já nasce preparada para receber pedidos com Pix, cartão ou boleto, mantendo o fluxo de compra mais confiável para o cliente e mais fácil de acompanhar para você."
  },
  {
    icon: ChartNoAxesCombined,
    title: "Decisões menos no chute",
    text: "Você passa a enxergar o que vende melhor, quais produtos ficam parados, quais clientes voltam e onde a operação precisa melhorar antes de investir mais."
  },
  {
    icon: PlugZap,
    title: "Estrutura pronta para crescer",
    text: "Quando a loja precisar de WhatsApp, ERP, marketplace, automações ou API, a base já está pensada para conectar sistemas sem refazer tudo do zero."
  },
  {
    icon: ShieldCheck,
    title: "Mais controle e segurança",
    text: "Dados de clientes, pedidos, acessos e histórico ficam separados e organizados, com permissões e registros que deixam a rotina mais segura para a equipe."
  }
];

const faqItems = [
  {
    question: "Preciso entender tecnologia para usar?",
    answer: "Não. A proposta é entregar um painel claro para produtos, pedidos, clientes e dinheiro sem depender de termos técnicos."
  },
  {
    question: "Qual plano eu devo assinar?",
    answer: "O orçamento guiado cruza catálogo, prazo, recursos e nível da operação para sugerir o plano mais coerente."
  },
  {
    question: "A plataforma serve para loja pequena?",
    answer: "Sim. Você pode começar com uma estrutura menor e evoluir para recursos de CRM, ERP, automações e relatórios."
  },
  {
    question: "Consigo acompanhar resultado?",
    answer: "Sim. A ideia é mostrar vendas, conversão, carrinhos, estoque, clientes e próximas ações em painéis simples."
  },
  {
    question: "Meus dados ficam separados?",
    answer: "Sim. A arquitetura separa cada loja, usuários, permissões, arquivos e histórico para reduzir bagunça operacional."
  },
  {
    question: "Posso integrar outros sistemas depois?",
    answer: "Sim. Os planos maiores já consideram API, webhooks e integrações para conectar a operação com sistemas externos."
  }
];

const architecturePillars = [
  { icon: DatabaseZap, label: "Perfil", detail: "seus dados ficam salvos para não repetir tudo" },
  { icon: LockKeyhole, label: "Login seguro", detail: "cada orçamento fica ligado à sua conta" },
  { icon: RadioTower, label: "Orçamento", detail: "você responde perguntas simples sobre a loja" },
  { icon: CloudCog, label: "Análise", detail: "eu vejo plano, recursos, prazo e prioridade" },
  { icon: PackageCheck, label: "Proposta", detail: "você recebe o caminho indicado para começar" },
  { icon: ClipboardList, label: "Histórico", detail: "orçamentos, suporte e respostas ficam registrados" }
];

const architectureSatellites = [
  { icon: UsersRound, label: "Cliente", detail: "acompanha tudo pela plataforma" },
  { icon: Smartphone, label: "Suporte", detail: "dúvidas e tickets no mesmo lugar" },
  { icon: BellRing, label: "E-mail", detail: "confirmações chegam automaticamente" },
  { icon: BarChart3, label: "Painel", detail: "admin visualiza e organiza cada etapa" }
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
  "lojas que precisam de atenção",
  "uso do sistema e arquivos",
  "avisos importantes em tempo real"
];

const merchantHighlights = [
  "vendas do dia, mês e ticket médio",
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
            <span>Projeção de crescimento</span>
            <strong>Próximos 90 dias</strong>
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
            <strong>Ganhos mais rápidos</strong>
          </div>
          {[
            ["Conversão", "82%"],
            ["Automação", "76%"],
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
        <Icon size={22} aria-hidden="true" />
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
    <main className="landing-shell enterprise-landing" onPointerMove={handlePointerMove} aria-labelledby="home-title">
      <section className="enterprise-hero" aria-labelledby="home-title">
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
            id="home-title"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            Venda online e controle sua loja em um só lugar.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            Uma plataforma para loja virtual, pedidos, estoque, clientes, pagamentos e relatórios.
            Você acompanha tudo sem precisar entender termos técnicos.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <a href="/orcamento" className="launch-cta">
              Solicitar orçamento
              <ArrowRight size={18} aria-hidden="true" />
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

      <section className="enterprise-section" aria-labelledby="modules-title">
        <div className="section-kicker">
          <p className="landing-eyebrow">Tudo conectado</p>
          <h2 id="modules-title">Mais que uma loja virtual: um painel para cuidar da venda inteira.</h2>
          <span>
            A loja vende, o painel organiza pedidos, o estoque avisa quando algo esta acabando
            e os relatórios mostram o que merece atenção.
          </span>
        </div>

        <div className="enterprise-module-grid">
          {enterpriseModules.map((item) => {
            const Icon = item.icon;

            return (
              <motion.article key={item.title} whileHover={{ y: -6 }}>
                <Icon size={22} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="enterprise-section proof-section" aria-labelledby="proof-title">
        <div className="section-kicker">
          <p className="landing-eyebrow">Motivos para assinar</p>
          <h2 id="proof-title">Assine para vender com mais clareza, controle e menos tarefas soltas.</h2>
          <span>
            A ideia não é apenas ter uma loja bonita. É reunir venda, pagamento, estoque,
            clientes e atendimento em uma rotina que você consegue entender e melhorar.
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
                <Icon size={24} aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="enterprise-split-section" id="arquitetura" aria-labelledby="architecture-title">
        <div className="section-kicker">
          <p className="landing-eyebrow">Como funciona</p>
          <h2 id="architecture-title">Do orçamento ao painel: tudo conectado em um fluxo simples.</h2>
          <span>
            Você cria o perfil, escolhe o plano, responde o orçamento guiado e acompanha
            suporte e respostas pela plataforma. No admin, eu vejo cada detalhe para montar
            o melhor caminho para sua loja.
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
            <Network size={26} aria-hidden="true" />
            <strong>Plataforma</strong>
            <span>cliente, orçamento e admin conectados</span>
          </div>

          <div className="architecture-pillars neural-pillars">
            {architecturePillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <article key={pillar.label} className={`neural-card neural-card-${index + 1}`}>
                  <Icon size={20} aria-hidden="true" />
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
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </article>
              );
            })}
          </div>

          <div className="architecture-process-note">
            {[
              ["01", "Escolha o plano", "Veja a cobertura que combina melhor com o momento da sua loja."],
              ["02", "Preencha o orçamento", "Responda perguntas simples sobre produtos, prazo e recursos desejados."],
              ["03", "Receba a análise", "Eu avalio o perfil, o plano escolhido e as necessidades do projeto."],
              ["04", "Acompanhe pelo painel", "O histórico, suporte e próximos passos ficam salvos na plataforma."]
            ].map(([step, label, description]) => (
              <span key={step}>
                <strong>{step}</strong>
                <i>
                  <em>{label}</em>
                  <small>{description}</small>
                </i>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="enterprise-section dashboards-section" aria-labelledby="dashboards-title">
        <div className="section-kicker">
          <p className="landing-eyebrow">Painéis claros</p>
          <h2 id="dashboards-title">O dono da loja entende rápido o que esta acontecendo.</h2>
        </div>

        <div className="dashboard-highlight-grid">
          <HighlightPanel
            eyebrow="Painel principal"
            title="Tudo que precisa de atenção"
            icon={Command}
            items={masterHighlights}
          />
          <HighlightPanel
            eyebrow="Painel da loja"
            title="Rotina diária mais simples"
            icon={Gauge}
            items={merchantHighlights}
          />
        </div>
      </section>

      <section className="enterprise-timeline-section" aria-labelledby="plans-title">
        <div className="section-kicker">
          <p className="landing-eyebrow">Planos simples</p>
          <h2 id="plans-title">Comece pequeno e aumente quando a loja precisar.</h2>
        </div>

        <div className="enterprise-plan-row">
          {subscriptionPlans.map((plan, index) => (
            <motion.article key={plan.key} whileHover={{ y: -7 }}>
              <span>{`0${index + 1}`}</span>
              <strong>{plan.name}</strong>
              <p>{plan.idealFor}</p>
              <a href="/assinaturas">
                Ver cobertura
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="enterprise-section faq-section" aria-labelledby="faq-title">
        <div className="section-kicker">
          <p className="landing-eyebrow">Dúvidas comuns</p>
          <h2 id="faq-title">Respostas rápidas para decidir com mais segurança.</h2>
          <span>
            Antes de pedir a análise, veja como a plataforma ajuda no começo,
            no crescimento e na organização da loja.
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

      <section className="enterprise-final-cta" aria-labelledby="final-cta-title">
        <div>
          <Sparkles size={22} aria-hidden="true" />
          <p className="landing-eyebrow">Pronto para vender melhor</p>
          <h2 id="final-cta-title">Descubra o plano ideal antes de assinar.</h2>
          <span>
            Responda algumas perguntas e receba uma sugestão clara com recursos,
            prioridade e caminho de crescimento para sua loja.
          </span>
        </div>

        <a href="/orcamento" className="launch-cta">
          Solicitar orçamento agora
          <Zap size={18} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}
