import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "FeedMe — Decentralized Feedback Evaluation",
  description:
    "Sistema descentralizado de evaluación de feedback con distribución de premios USDC vía smart contract.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
      </body>
    </html>
  );
}
