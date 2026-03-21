import ConnectWallet from "@/modules/wallet/view/ui/ConnectWallet";
import IssueCertificateForm from "../ui/CertForm";

export default function IssuePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-bold">Issue Certificate</h1>
        <ConnectWallet />
      </div>

      <IssueCertificateForm />
    </main>
  );
}
