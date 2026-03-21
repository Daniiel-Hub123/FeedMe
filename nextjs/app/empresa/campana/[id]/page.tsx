"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCampaign, getCampaignResults, generateCodes, listCodes } from "../../../lib/api";

export default function CampanaDetailPage() {
  const params = useParams();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genCount, setGenCount] = useState("10");
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<"overview" | "codes" | "results">("overview");

  useEffect(() => {
    if (!campaignId) return;
    Promise.all([
      getCampaign(campaignId).then(setCampaign).catch(() => null),
      getCampaignResults(campaignId).then(setResults).catch(() => null),
      listCodes(campaignId).then((data: any) => setCodes(Array.isArray(data) ? data : [])).catch(() => []),
    ]).finally(() => setLoading(false));
  }, [campaignId]);

  const handleGenerateCodes = async () => {
    setGenerating(true);
    try {
      const newCodes: any = await generateCodes(campaignId, Number(genCount));
      setCodes([...newCodes, ...codes]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: "300px" }} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h2>Campaña no encontrada</h2>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <h1 style={{ margin: 0 }}>{campaign.title}</h1>
          <span
            className={`badge ${
              campaign.status === "ACTIVE" ? "badge-success" : campaign.status === "FINALIZED" ? "badge-info" : "badge-warning"
            }`}
          >
            {campaign.status}
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          💰 {campaign.total_deposit} USDC · 📅 Termina: {new Date(campaign.end_date).toLocaleDateString()} · 🎯 {campaign.aspects?.length} aspectos
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {(["overview", "codes", "results"] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? "btn-primary" : "btn-secondary"}
            onClick={() => setTab(t)}
            style={{ padding: "0.5rem 1.25rem" }}
          >
            {t === "overview" ? "📋 General" : t === "codes" ? `🔑 Códigos (${codes.length})` : "🏆 Resultados"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid-2">
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3>Aspectos</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {campaign.aspects?.map((a: any) => (
                <div key={a.id || a.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-primary">{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3>Premios por Aspecto</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>🥇 Tier 1</span>
                <span style={{ fontWeight: 600 }}>{campaign.tier1_amount} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>🥈 Tier 2</span>
                <span style={{ fontWeight: 600 }}>{campaign.tier2_amount} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>🥉 Tier 3</span>
                <span style={{ fontWeight: 600 }}>{campaign.tier3_amount} USDC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Codes Tab */}
      {tab === "codes" && (
        <div>
          <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Generar Nuevos Códigos</h3>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Cantidad</label>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  max={1000}
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleGenerateCodes}
                disabled={generating}
                style={{ height: "fit-content" }}
              >
                {generating ? "Generando..." : "🔑 Generar"}
              </button>
            </div>
          </div>

          {codes.length > 0 && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Códigos ({codes.length})</h3>
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {codes.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: c.used ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${c.used ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{c.code}</span>
                    <span>{c.used ? "🔥" : "✓"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {tab === "results" && results && (
        <div>
          {Object.entries(results.results_by_aspect || {}).map(([aspectName, data]: [string, any]) => (
            <div key={aspectName} className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>
                🎯 {aspectName}
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 400, marginLeft: "0.75rem" }}>
                  {data.valid_participants}/{data.total_participants} participantes válidos
                </span>
              </h3>

              {data.top3?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {data.top3.map((w: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem 1rem",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-glass)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.25rem" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </span>
                        <span style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                          {w.wallet?.slice(0, 6)}...{w.wallet?.slice(-4)}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className="badge badge-info">Score: {w.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)" }}>
                  Sin participantes válidos — fondos se devuelven a la empresa.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
