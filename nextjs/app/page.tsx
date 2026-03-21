<<<<<<< HEAD
import ConnectWallet from "@/modules/wallet/view/ui/ConnectWallet";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Web3 Base</h1>
      <ConnectWallet />
=======
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "calc(100vh - 60px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          position: "relative",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(60px)",
          }}
        />

        <div className="animate-in stagger-1" style={{ marginBottom: "1rem" }}>
          <span className="badge badge-primary" style={{ fontSize: "0.85rem", padding: "0.35rem 1rem" }}>
            ⛓️ Powered by Blockchain
          </span>
        </div>

        <h1
          className="animate-in stagger-2"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            maxWidth: "800px",
            marginBottom: "1.5rem",
          }}
        >
          Evaluación de Feedback{" "}
          <span className="text-gradient">Descentralizada</span>
        </h1>

        <p
          className="animate-in stagger-3"
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.15rem",
            maxWidth: "600px",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          Las empresas crean campañas de evaluación y depositan USDC.
          Los usuarios envían feedback de calidad y los mejores reciben premios automáticos vía smart contract.
        </p>

        <div className="animate-in stagger-4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/empresa" className="btn-primary" style={{ textDecoration: "none" }}>
            🏢 Soy Empresa
          </Link>
          <Link href="/usuario" className="btn-secondary" style={{ textDecoration: "none" }}>
            👤 Soy Usuario
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ paddingBottom: "4rem" }}>
        <div className="grid-3">
          {[
            {
              icon: "🤖",
              title: "4 Agentes IA",
              desc: "Sistema multiagente evalúa profundidad, especificidad, coherencia y relevancia de cada feedback.",
            },
            {
              icon: "🔒",
              title: "Escrow Inmutable",
              desc: "Los fondos se bloquean en un smart contract. Nadie puede retirarlos hasta que se calculen los ganadores.",
            },
            {
              icon: "💎",
              title: "Pagos Automáticos",
              desc: "Los premios USDC se distribuyen directamente a las wallets de los ganadores. Sin intermediarios.",
            },
            {
              icon: "🏆",
              title: "Ranking Justo",
              desc: "Mayor score gana. En caso de empate, el que envió primero tiene prioridad. 100% transparente.",
            },
            {
              icon: "🛡️",
              title: "Anti-Fraude",
              desc: "Detección de feedback basura, código de un solo uso, una wallet por campaña. Reglas inquebrantables.",
            },
            {
              icon: "📊",
              title: "Auditoría On-Chain",
              desc: "Cada pago emite un evento verificable en la blockchain. Transparencia total para siempre.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-card animate-in"
              style={{
                padding: "1.75rem",
                animationDelay: `${0.1 * (i + 1)}s`,
                opacity: 0,
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <h3 style={{ marginBottom: "0.5rem" }}>{feature.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
>>>>>>> 411f0e7e32a24c4a8a2b7e3577564d2e6476ba0d
    </main>
  );
}
