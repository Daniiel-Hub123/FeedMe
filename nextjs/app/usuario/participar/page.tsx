"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCampaign, submitFeedback } from "../../lib/api";
import { connectWallet, getConnectedAddress } from "../../lib/wallet";
import ScoreDisplay from "../../components/ScoreDisplay";

function ParticiparContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaign") || "";

  const [campaign, setCampaign] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    code: "",
    aspectId: "",
    text: "",
  });

  useEffect(() => {
    getConnectedAddress().then(setAddress);
    if (campaignId) {
      getCampaign(campaignId)
        .then(setCampaign)
        .catch(() => null)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [campaignId]);

  const wordCount = form.text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let wallet = address;
      if (!wallet) {
        const { address: addr } = await connectWallet();
        wallet = addr;
        setAddress(addr);
      }

      const res: any = await submitFeedback({
        wallet: wallet!,
        campaign_id: campaignId,
        aspect_id: form.aspectId,
        code: form.code,
        text: form.text,
      });

      setResult(res);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: "700px" }}>
        <div className="skeleton" style={{ height: "400px" }} />
      </div>
    );
  }

  if (!campaignId || !campaign) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h2>No se especificó una campaña</h2>
        <p style={{ color: "var(--text-secondary)" }}>Selecciona una campaña activa desde el panel de usuario.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container" style={{ maxWidth: "600px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1>
            {result.status === "EVALUATED" ? "✅" : "❌"} Feedback{" "}
            <span className="text-gradient">
              {result.status === "EVALUATED" ? "Evaluado" : "Descartado"}
            </span>
          </h1>
        </div>

        <ScoreDisplay
          depth={result.depth}
          specificity={result.specificity}
          coherence={result.coherence}
          relevance={result.relevance}
          diversity={result.diversity}
          totalScore={result.total_score}
          status={result.status}
          justification={result.justification}
        />

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="btn-secondary" onClick={() => router.push("/usuario")}>
            ← Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>
        Participar en <span className="text-gradient">{campaign.title}</span>
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        {campaign.description || "Envía tu feedback de calidad y compite por premios USDC."}
      </p>

      <form onSubmit={handleSubmit}>
        {/* Code input */}
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>🔑 Código de Participación</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Código alfanumérico</label>
            <input
              className="input-field"
              placeholder="Ej: AX7B2KM9"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              maxLength={8}
              style={{ fontFamily: "monospace", letterSpacing: "0.15em", fontSize: "1.1rem" }}
              required
            />
          </div>
        </div>

        {/* Aspect selection */}
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>🎯 Selecciona el Aspecto</h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {campaign.aspects?.map((a: any) => (
              <button
                type="button"
                key={a.id}
                onClick={() => setForm({ ...form, aspectId: a.id })}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: form.aspectId === a.id
                    ? "2px solid var(--color-primary)"
                    : "1px solid var(--border-glass)",
                  background: form.aspectId === a.id
                    ? "rgba(99,102,241,0.15)"
                    : "var(--bg-glass)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: form.aspectId === a.id ? 600 : 400,
                  transition: "all 0.2s ease",
                  fontSize: "0.95rem",
                }}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>💬 Tu Feedback</h3>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label className="form-label">Escribe tu feedback detallado</label>
            <textarea
              className="input-field"
              placeholder="Sé específico, incluye detalles concretos, ejemplos y observaciones útiles. Los feedbacks de mayor calidad reciben mejores puntajes y premios más altos..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows={8}
              required
              style={{ minHeight: "200px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.85rem",
                color: wordCount < 50 ? "var(--color-warning)" : "var(--color-success)",
              }}
            >
              {wordCount} palabra{wordCount !== 1 ? "s" : ""}
              {wordCount < 50 && " (mínimo recomendado: 50)"}
            </span>

            {wordCount < 50 && (
              <span className="badge badge-warning">⚠️ Penalización por brevedad</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || !form.code || !form.aspectId || !form.text}
          style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "1rem" }}
        >
          {submitting ? "Evaluando con IA..." : "📤 Enviar Feedback"}
        </button>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
          ⚠️ Una vez enviado, no podrás editar tu feedback ni participar de nuevo en esta campaña.
        </p>
      </form>
    </div>
  );
}

export default function ParticiparPage() {
  return (
    <Suspense fallback={<div className="container"><div className="skeleton" style={{ height: "400px" }} /></div>}>
      <ParticiparContent />
    </Suspense>
  );
}
