const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Generic fetch wrapper for the backend API.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }

  return res.json();
}

// ──────────── Campaigns ────────────

export async function createCampaign(data: {
  title: string;
  description: string;
  creator_wallet: string;
  aspects: { name: string }[];
  tier1_amount: number;
  tier2_amount: number;
  tier3_amount: number;
  duration_days: number;
  tx_hash?: string;
}) {
  return apiFetch("/campaigns/", { method: "POST", body: JSON.stringify(data) });
}

export async function getCampaign(id: string) {
  return apiFetch(`/campaigns/${id}`);
}

export async function listCampaigns() {
  return apiFetch("/campaigns/");
}

export async function generateCodes(campaignId: string, quantity: number) {
  return apiFetch(`/campaigns/${campaignId}/codes`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

export async function listCodes(campaignId: string) {
  return apiFetch(`/campaigns/${campaignId}/codes`);
}

export async function getCampaignResults(campaignId: string) {
  return apiFetch(`/campaigns/${campaignId}/results`);
}

// ──────────── Feedback ────────────

export async function submitFeedback(data: {
  wallet: string;
  campaign_id: string;
  aspect_id: string;
  code: string;
  text: string;
}) {
  return apiFetch("/feedback/", { method: "POST", body: JSON.stringify(data) });
}

export async function getFeedback(id: string) {
  return apiFetch(`/feedback/${id}`);
}
