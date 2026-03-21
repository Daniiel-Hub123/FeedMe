"use client";

import { certificateAbi, CONTRACT_ADDRESS } from "@/modules/shared/view/config/contract";
import { useReadContract } from "wagmi";

export default function VerifyPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: certificateAbi,
    functionName: "getCertificate",
    args: [params.id],
  });

  if (isLoading) return <main className="p-8">Loading...</main>;
  if (error) return <main className="p-8">Error loading certificate</main>;

  if (!data) return <main className="p-8">No data found</main>;

  const [
    id,
    recipient,
    issuer,
    metadataHash,
    metadataURI,
    issuedAt,
    revoked,
    exists,
  ] = data;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl rounded-2xl border p-6 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold">Certificate Verification</h1>

        {!exists ? (
          <p className="text-red-600">Certificate not found</p>
        ) : revoked ? (
          <p className="text-orange-600">Certificate revoked</p>
        ) : (
          <p className="text-green-600">Certificate verified</p>
        )}

        <div className="mt-6 space-y-2 text-sm">
          <p><strong>ID:</strong> {id}</p>
          <p><strong>Recipient:</strong> {recipient}</p>
          <p><strong>Issuer:</strong> {issuer}</p>
          <p><strong>Metadata hash:</strong> {metadataHash}</p>
          <p><strong>Metadata URI:</strong> {metadataURI}</p>
          <p>
            <strong>Issued at:</strong>{" "}
            {Number(issuedAt) > 0
              ? new Date(Number(issuedAt) * 1000).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>
    </main>
  );
}