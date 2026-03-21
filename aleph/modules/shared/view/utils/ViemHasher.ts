import { keccak256, stringToHex } from "viem";

export function generateCertificateHash(metadata: Record<string, unknown>) {
  const stable = JSON.stringify(metadata);
  return keccak256(stringToHex(stable));
}