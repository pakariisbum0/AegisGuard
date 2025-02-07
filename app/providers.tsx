"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { defineChain } from "viem";

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable");
}

// Define Sepolia testnet
const sepoliaChain = defineChain({
  id: 11155111,
  name: "EVM on FLow Testnet",
  network: "EVM on FLow Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "EMVFlow",
    symbol: "FLOW",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.evm.nodes.onflow.org"],
    },
  },
  blockExplorers: {
    default: { name: "Flow Explorer", url: "https://evm-testnet.flowscan.io" },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ["wallet", "email"], // Added email as a backup option
        appearance: {
          theme: "light",
          accentColor: "#674188",
          showWalletLoginFirst: true,
        },
        supportedChains: [sepoliaChain],
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  );
}
