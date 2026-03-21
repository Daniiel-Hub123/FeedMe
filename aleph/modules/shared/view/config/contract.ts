export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const certificateAbi = [
  {
    type: "function",
    name: "issueCertificate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "string" },
      { name: "recipient", type: "address" },
      { name: "metadataHash", type: "bytes32" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCertificate",
    stateMutability: "view",
    inputs: [{ name: "id", type: "string" }],
    outputs: [
      { name: "", type: "string" },
      { name: "", type: "address" },
      { name: "", type: "address" },
      { name: "", type: "bytes32" },
      { name: "", type: "string" },
      { name: "", type: "uint256" },
      { name: "", type: "bool" },
      { name: "", type: "bool" },
    ],
  },
] as const;