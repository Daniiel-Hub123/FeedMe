import ConnectWallet from "@/modules/wallet/view/ui/ConnectWallet";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Web3 Base</h1>
      <ConnectWallet />
    </main>
  );
}
