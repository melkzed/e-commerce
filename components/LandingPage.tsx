"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import {
  ArrowRight,
  Bot,
  Boxes,
  CircleDollarSign,
  Gauge,
  MailCheck,
  MousePointer2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PlatformNav } from "@/components/PlatformNav";
import { subscriptionPlans } from "@/lib/platform";

function EngineCore() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(140 * 3);

    for (let index = 0; index < 140; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 7.2;
      data[index * 3 + 1] = (Math.random() - 0.5) * 3.9;
      data[index * 3 + 2] = (Math.random() - 0.5) * 3.8;
    }

    return data;
  }, []);

  useFrame(({ clock, pointer }) => {
    const elapsed = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = pointer.x * 0.42 + Math.sin(elapsed * 0.35) * 0.12;
      groupRef.current.rotation.x = -pointer.y * 0.26 + Math.sin(elapsed * 0.42) * 0.06;
      groupRef.current.position.y = Math.sin(elapsed * 0.9) * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.42;
    }
  });

  return (
    <group ref={groupRef} position={[1.35, -0.05, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#c8a6ff" size={0.021} transparent opacity={0.72} />
      </points>

      <mesh ref={ringRef} rotation={[Math.PI / 2.7, 0.12, 0]}>
        <torusGeometry args={[1.16, 0.018, 16, 160]} />
        <meshStandardMaterial color="#cfb4ff" emissive="#6d28d9" emissiveIntensity={1.2} />
      </mesh>

      <mesh rotation={[0.45, 0.35, 0.08]}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#2e1065"
          emissiveIntensity={0.76}
          metalness={0.42}
          roughness={0.28}
        />
      </mesh>

      {[-1.55, -0.8, 0, 0.8, 1.55].map((x, index) => (
        <mesh key={x} position={[x, Math.sin(index) * 0.22, -0.72]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.9, 0.026, 0.026]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#9fffe0" : "#f2c572"}
            emissive={index % 2 === 0 ? "#14b8a6" : "#d97706"}
            emissiveIntensity={1.15}
          />
        </mesh>
      ))}

      {[0, 1, 2].map((item) => (
        <mesh
          key={item}
          position={[-0.92 + item * 0.9, -0.92 + item * 0.18, 0.5]}
          rotation={[0.28, item * 0.42, 0.14]}
        >
          <boxGeometry args={[0.34, 0.34, 0.34]} />
          <meshStandardMaterial
            color="#1b1038"
            emissive="#c4b5fd"
            emissiveIntensity={0.28 + item * 0.18}
            metalness={0.35}
            roughness={0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 44 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.7]}
    >
      <ambientLight intensity={0.42} />
      <directionalLight position={[3.5, 2.5, 3.5]} intensity={2.2} />
      <pointLight position={[-2.8, 0.2, 2.4]} color="#8b5cf6" intensity={4.8} />
      <pointLight position={[2.2, -1, 2.8]} color="#14b8a6" intensity={1.7} />
      <EngineCore />
    </Canvas>
  );
}

export function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 18 });
  const railX = useTransform(smoothX, [0, 1], [-18, 18]);
  const railY = useTransform(smoothY, [0, 1], [-10, 10]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  };

  return (
    <main className="landing-shell" onPointerMove={handlePointerMove}>
      <PlatformNav />

      <section className="landing-hero">
        <div className="hero-track-lines" aria-hidden="true" />
        <motion.div className="hero-motion-rails" style={{ x: railX, y: railY }} aria-hidden="true">
          <span />
          <span />
          <span />
        </motion.div>

        <div className="hero-scene" aria-hidden="true">
          <HeroScene />
        </div>

        <div className="hero-copy">
          <motion.p className="landing-eyebrow">
            Plataforma SaaS para lojas online
          </motion.p>
          <motion.h1>
            Lojas online por assinatura com briefing inteligente.
          </motion.h1>
          <motion.p>
            Uma experiencia imersiva para captar clientes, levantar requisitos,
            organizar perfis, acionar emails e transformar o pedido em plano de execucao.
          </motion.p>

          <motion.div className="hero-actions">
            <a href="/orcamento" className="launch-cta">
              Solicitar orcamento
              <ArrowRight size={18} />
            </a>
            <a href="/assinaturas" className="ghost-cta">
              Ver assinaturas
            </a>
          </motion.div>
        </div>

        <div className="hero-dash">
          {[
            ["Bot", "5 perguntas diretas"],
            ["Perfil", "dados revisaveis"],
            ["Email", "cliente e admin"],
            ["Painel", "pipeline comercial"]
          ].map(([label, value]) => (
            <motion.div
              key={label}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="landing-band">
        <div className="band-heading">
          <p className="landing-eyebrow">Fluxo desenhado para conversao</p>
          <h2>Da primeira visita ao pedido no painel.</h2>
        </div>

        <div className="motion-feature-grid">
          {[
            {
              icon: Bot,
              title: "Chatbot por etapas",
              text: "O cliente responde uma pergunta por tela, sem preco exposto antes da analise."
            },
            {
              icon: ShieldCheck,
              title: "Login e perfil",
              text: "Google Auth, dados protegidos e resumo editavel antes do envio."
            },
            {
              icon: MailCheck,
              title: "Emails automaticos",
              text: "Confirmacao para o cliente e alerta administrativo para sua caixa."
            },
            {
              icon: Gauge,
              title: "Painel admin",
              text: "Solicitacoes centralizadas com plano sugerido, status e historico."
            }
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                whileHover={{ y: -6 }}
              >
                <Icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="landing-plans-preview">
        <div className="band-heading">
          <p className="landing-eyebrow">Tres assinaturas</p>
          <h2>Voce define os valores depois; a plataforma organiza a cobertura.</h2>
        </div>

        <div className="preview-plan-row">
          {subscriptionPlans.map((plan) => (
            <motion.article key={plan.key} whileHover={{ y: -8, rotateX: 2 }}>
              <span>{plan.signal}</span>
              <strong>{plan.name}</strong>
              <p>{plan.idealFor}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <MousePointer2 size={20} />
        <div>
          <h2>Pronto para transformar interesse em briefing?</h2>
          <p>O bot pergunta, o sistema resume, o email confirma e o painel recebe.</p>
        </div>
        <a href="/orcamento" className="launch-cta">
          Comecar agora
          <Sparkles size={18} />
        </a>
      </section>
    </main>
  );
}
