"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { connectWallet, getConnectedAddress, shortenAddress, switchToSepolia } from "../lib/wallet";

export default function Navbar() {
  const pathname = usePathname();
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    getConnectedAddress().then(setAddress);

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAddress(accounts[0] || null);
      });
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await switchToSepolia();
      const { address: addr } = await connectWallet();
      setAddress(addr);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span style={{ fontSize: "1.5rem" }}>⚡</span>
        <span className="text-gradient">FeedbackEval</span>
      </Link>

      <div className="navbar-links">
        <Link href="/empresa" className={pathname?.startsWith("/empresa") ? "active" : ""}>
          🏢 Empresa
        </Link>
        <Link href="/usuario" className={pathname?.startsWith("/usuario") ? "active" : ""}>
          👤 Usuario
        </Link>

        {address ? (
          <button className="btn-wallet" style={{ cursor: "default" }}>
            🦊 {shortenAddress(address)}
          </button>
        ) : (
          <button className="btn-wallet" onClick={handleConnect} disabled={connecting}>
            {connecting ? "Conectando..." : "🦊 Conectar Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
