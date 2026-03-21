"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "../../lib/api";
import { connectWallet } from "../../lib/wallet";
import { ethers, BrowserProvider, Contract } from "ethers";
import { CONTRACTS, ESCROW_ABI, ERC20_ABI, parseUSDC } from "../../lib/contracts";

export default function CrearCampanaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "deposit" | "done">("form");

  const [form, setForm] = useState({
    title: "",
    description: "",
    aspects: [""],
    tier1: "100",
    tier2: "50",
    tier3: "25",
    duration: "30",
  });

  const addAspect = () => {
    if (form.aspects.length < 10) {
      setForm({ ...form, aspects: [...form.aspects, ""] });
    }
  };

  const removeAspect = (i: number) => {
    if (form.aspects.length > 1) {
      setForm({ ...form, aspects: form.aspects.filter((_, idx) => idx !== i) });
    }
  };

  const updateAspect = (i: number, value: string) => {
    const updated = [...form.aspects];
    updated[i] = value;
    setForm({ ...form, aspects: updated });
  };

  const totalPerAspect = Number(form.tier1) + Number(form.tier2) + Number(form.tier3);
  const totalDeposit = totalPerAspect * form.aspects.filter((a) => a.trim()).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Connect wallet
      const { address, signer, provider } = await connectWallet();
      setStep("deposit");

      // 2. Approve USDC spending (if contract addresses are configured)
      let txHash: string | undefined;
      if (CONTRACTS.ESCROW && CONTRACTS.USDC) {
        const usdc = new Contract(CONTRACTS.USDC, ERC20_ABI, signer);
        const approveTx = await usdc.approve(CONTRACTS.ESCROW, parseUSDC(totalDeposit));
        await approveTx.wait();

        // 3. Create campaign on smart contract
        const escrow = new Contract(CONTRACTS.ESCROW, ESCROW_ABI, signer);
        const endDate = Math.floor(Date.now() / 1000) + Number(form.duration) * 86400;
        const validAspects = form.aspects.filter((a) => a.trim());
        const createTx = await escrow.createCampaign(
          `camp_${Date.now()}`,
          endDate,
          validAspects.length,
          parseUSDC(totalDeposit)
        );
        const receipt = await createTx.wait();
        txHash = receipt.hash;
      }

      // 4. Create campaign in backend
      const validAspects = form.aspects.filter((a) => a.trim());
      await createCampaign({
        title: form.title,
        description: form.description,
        creator_wallet: address,
        aspects: validAspects.map((name) => ({ name })),
        tier1_amount: Number(form.tier1),
        tier2_amount: Number(form.tier2),
        tier3_amount: Number(form.tier3),
        duration_days: Number(form.duration),
        tx_hash: txHash,
      });

      setStep("done");
      setTimeout(() => router.push("/empresa"), 2000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  if (step === "deposit") {
    return (
      <div className="container" style={{ maxWidth: "600px", textAlign: "center", paddingTop: "4rem" }}>
        <div className="glass-card" style={{ padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🦊</div>
          <h2>Confirma en MetaMask</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Aprueba la transacción de {totalDeposit} USDC para crear la campaña.
            <br />Los fondos quedarán bloqueados en el smart contract.
          </p>
          <div className="skeleton" style={{ height: "4px", marginTop: "2rem" }} />
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="container" style={{ maxWidth: "600px", textAlign: "center", paddingTop: "4rem" }}>
        <div className="glass-card" style={{ padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <h2>¡Campaña Creada!</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Tu campaña se ha creado y los fondos están bloqueados. Redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>
        Crear <span className="text-gradient">Campaña</span>
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        Define los aspectos a evaluar, los premios por tier y la duración.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>📋 Información General</h3>

          <div className="form-group">
            <label className="form-label">Título de la campaña</label>
            <input
              className="input-field"
              placeholder="Ej: Evaluación App Móvil Q1 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <textarea
              className="input-field"
              placeholder="Describe qué quieres que los usuarios evalúen..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duración (días)</label>
            <input
              className="input-field"
              type="number"
              min={3}
              max={90}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Aspects */}
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ margin: 0 }}>🎯 Aspectos a Evaluar</h3>
            <button type="button" className="btn-secondary" onClick={addAspect} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              disabled={form.aspects.length >= 10}>
              + Agregar
            </button>
          </div>

          {form.aspects.map((aspect, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <input
                className="input-field"
                placeholder={`Aspecto ${i + 1} (ej: Diseño UI, Funcionalidad, Soporte)`}
                value={aspect}
                onChange={(e) => updateAspect(i, e.target.value)}
                required
              />
              {form.aspects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAspect(i)}
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                    borderRadius: "var(--radius-md)",
                    padding: "0 0.75rem",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
            Mínimo 1, máximo 10 aspectos.
          </p>
        </div>

        {/* Tiers */}
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>💰 Premios por Tier (USDC por aspecto)</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            {[
              { label: "🥇 Tier 1 (1er lugar)", key: "tier1" as const },
              { label: "🥈 Tier 2 (2do lugar)", key: "tier2" as const },
              { label: "🥉 Tier 3 (3er lugar)", key: "tier3" as const },
            ].map((tier) => (
              <div key={tier.key} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>{tier.label}</label>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  step="0.01"
                  value={form[tier.key]}
                  onChange={(e) => setForm({ ...form, [tier.key]: e.target.value })}
                  required
                />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem",
              background: "rgba(99,102,241,0.1)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Por aspecto:</span>
              <span style={{ fontWeight: 600 }}>{totalPerAspect} USDC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Aspectos válidos:</span>
              <span style={{ fontWeight: 600 }}>{form.aspects.filter((a) => a.trim()).length}</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border-glass)", margin: "0.75rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
              <span className="text-gradient" style={{ fontWeight: 700 }}>Depósito Total:</span>
              <span className="text-gradient" style={{ fontWeight: 800 }}>{totalDeposit} USDC</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "1rem" }}
        >
          {loading ? "Procesando..." : `🔒 Depositar ${totalDeposit} USDC y Crear Campaña`}
        </button>
      </form>
    </div>
  );
}
