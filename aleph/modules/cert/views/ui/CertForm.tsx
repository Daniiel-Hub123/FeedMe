"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import { generateCertificateHash } from "@/modules/shared/view/utils/ViemHasher";
import { certificateAbi, CONTRACT_ADDRESS } from "@/modules/shared/view/config/contract";

const schema = z.object({
  certificateId: z.string().min(3),
  studentName: z.string().min(3),
  courseName: z.string().min(3),
  recipientWallet: z.string().min(42),
});

type FormValues = z.infer<typeof schema>;

export default function IssueCertificateForm() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const { writeContractAsync, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const onSubmit = async (values: FormValues) => {
    const metadata = {
      certificateId: values.certificateId,
      studentName: values.studentName,
      courseName: values.courseName,
      issuedAt: new Date().toISOString(),
      recipientWallet: values.recipientWallet,
    };

    const metadataHash = generateCertificateHash(metadata);

    // MVP: metadataURI fake o temporal
    const metadataURI = `https://example.com/certificates/${values.certificateId}.json`;

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: certificateAbi,
        functionName: "issueCertificate",
        args: [
          values.certificateId,
          values.recipientWallet as `0x${string}`,
          metadataHash,
          metadataURI,
        ],
      });

      setTxHash(hash);
      reset();
    } catch (error) {
      console.error(error);
      alert("Error issuing certificate");
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">Issue Certificate</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("certificateId")}
          placeholder="CERT-001"
          className="w-full rounded-lg border p-3"
        />

        <input
          {...register("studentName")}
          placeholder="Student name"
          className="w-full rounded-lg border p-3"
        />

        <input
          {...register("courseName")}
          placeholder="Course name"
          className="w-full rounded-lg border p-3"
        />

        <input
          {...register("recipientWallet")}
          placeholder="0x..."
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full rounded-lg bg-blue-600 p-3 text-white disabled:opacity-60"
        >
          {isPending || isConfirming ? "Processing..." : "Issue certificate"}
        </button>
      </form>

      {txHash && (
        <p className="mt-4 text-sm break-all">
          Tx: {txHash}
        </p>
      )}

      {isSuccess && (
        <p className="mt-2 text-sm text-green-600">
          Certificate issued successfully
        </p>
      )}
    </div>
  );
}