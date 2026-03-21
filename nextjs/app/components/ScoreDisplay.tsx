"use client";

interface ScoreDisplayProps {
  depth: number;
  specificity: number;
  coherence: number;
  relevance: number;
  diversity: number;
  totalScore: number;
  status: string;
  justification?: string | null;
}

function getScoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 75) return "excellent";
  if (pct >= 50) return "good";
  if (pct >= 25) return "average";
  return "poor";
}

export default function ScoreDisplay({
  depth,
  specificity,
  coherence,
  relevance,
  diversity,
  totalScore,
  status,
  justification,
}: ScoreDisplayProps) {
  const criteria = [
    { label: "Profundidad", value: depth, max: 35 },
    { label: "Especificidad", value: specificity, max: 25 },
    { label: "Coherencia", value: coherence, max: 20 },
    { label: "Relevancia", value: relevance, max: 10 },
    { label: "Diversidad", value: diversity, max: 10 },
  ];

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      {/* Header with total score */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ margin: 0 }}>Score Final</h3>
          <span className={`badge ${status === "EVALUATED" ? "badge-success" : status === "DISCARDED" ? "badge-danger" : "badge-warning"}`}>
            {status === "EVALUATED" ? "✓ Evaluado" : status === "DISCARDED" ? "✗ Descartado" : "⏳ Pendiente"}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            className="text-gradient"
            style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1 }}
          >
            {totalScore}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>/ 100</div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {criteria.map((c) => (
          <div key={c.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{c.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {c.value}/{c.max}
              </span>
            </div>
            <div className="score-bar">
              <div
                className={`score-bar-fill ${getScoreColor(c.value, c.max)}`}
                style={{ width: `${(c.value / c.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Justification */}
      {justification && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-glass)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Justificación
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {justification}
          </p>
        </div>
      )}
    </div>
  );
}
