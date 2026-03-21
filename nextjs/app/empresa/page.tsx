"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listCampaigns } from "../lib/api";
import { getConnectedAddress, shortenAddress } from "../lib/wallet";

export default function EmpresaPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnectedAddress().then(setAddress);
    listCampaigns()
      .then((data: any) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>
            Panel <span className="text-gradient">Empresa</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Crea campañas, genera códigos y distribuye premios.
          </p>
        </div>
        <Link href="/empresa/crear-campana" className="btn-primary" style={{ textDecoration: "none" }}>
          + Nueva Campaña
        </Link>
      </div>

      {!address && (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            🦊 Conecta tu wallet para crear y gestionar campañas
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: "200px" }} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3>No hay campañas aún</h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Crea tu primera campaña de evaluación de feedback.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {campaigns.map((c: any, i: number) => (
            <Link
              key={c.id}
              href={`/empresa/campana/${c.id}`}
              className="glass-card animate-in"
              style={{
                padding: "1.5rem",
                textDecoration: "none",
                color: "inherit",
                animationDelay: `${0.05 * i}s`,
                opacity: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>{c.title}</h3>
                <span
                  className={`badge ${
                    c.status === "ACTIVE" ? "badge-success" : c.status === "FINALIZED" ? "badge-info" : "badge-warning"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {c.aspects?.map((a: any) => (
                  <span key={a.id || a.name} className="badge badge-primary">{a.name}</span>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                <span>💰 {c.total_deposit} USDC</span>
                <span>📅 {new Date(c.end_date).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
