"use client"
import type { Metadata } from "next";
import "./globals.css";
<<<<<<< HEAD
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { WAGMI_CONFIG } from "@/modules/shared/view/config/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


=======
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "FeedMe — Decentralized Feedback Evaluation",
  description:
    "Sistema descentralizado de evaluación de feedback con distribución de premios USDC vía smart contract.",
};
>>>>>>> 411f0e7e32a24c4a8a2b7e3577564d2e6476ba0d

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
<<<<<<< HEAD
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WagmiProvider config={WAGMI_CONFIG}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
=======
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}
>>>>>>> 411f0e7e32a24c4a8a2b7e3577564d2e6476ba0d
      </body>
    </html>
  );
}
