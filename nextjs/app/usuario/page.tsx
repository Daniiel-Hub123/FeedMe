"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listCampaigns } from "../lib/api";
import { getConnectedAddress, shortenAddress } from "../lib/wallet";

export default function UsuarioPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnectedAddress().then(setAddress);
    listCampaigns()
      .then((data: any) => {
        const active = (Array.isArray(data) ? data : []).filter((c: any) => c.status === "ACTIVE");
        setCampaigns(active);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>
          Panel <span className="text-gradient">Usuario</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          Participa en campañas activas y recibe premios USDC por tu feedback.
        </p>
      </div>

      {!address && (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            🦊 Conecta tu wallet para participar en campañas
          </p>
        </div>
      )}

      <h2 style={{ marginBottom: "1rem" }}>🔥 Campañas Activas</h2>

      {loading ? (
        <div className="grid-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: "180px" }} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <h3>No hay campañas activas</h3>
          <p style={{ color: "var(--text-secondary)" }}>Las campañas disponibles aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid-2">
          {campaigns.map((c: any, i: number) => (
            <div
              key={c.id}
              className="glass-card animate-in"
              style={{
                padding: "1.5rem",
                animationDelay: `${0.05 * i}s`,
                opacity: 0,
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>{c.title}</h3>
              {c.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {c.description.slice(0, 100)}{c.description.length > 100 ? "..." : ""}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {c.aspects?.map((a: any) => (
                  <span key={a.id || a.name} className="badge badge-primary">{a.name}</span>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  💰 {c.total_deposit} USDC · 📅 {new Date(c.end_date).toLocaleDateString()}
                </span>
                <Link
                  href={`/usuario/participar?campaign=${c.id}`}
                  className="btn-primary"
                  style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  Participar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
