import { privyServer } from "./server";
import type { Quantity } from "@privy-io/server-auth";

export async function sendTokens(
  walletId: string,
  toAddress: `0x${string}`,
  amount: string
) {
  try {
    const hexAmount = `0x${BigInt(amount).toString(16)}` as Quantity;
    const chainId = `0x${(84532).toString(16)}` as Quantity;

    const response = await privyServer.walletApi.ethereum.sendTransaction({
      walletId,
      caip2: "eip155:84532", // Base Sepolia testnet
      transaction: {
        to: toAddress,
        value: hexAmount,
        chainId,
      },
    });

    return response.hash; // Response directly contains hash
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
}
