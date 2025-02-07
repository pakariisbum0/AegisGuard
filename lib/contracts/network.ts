// Create a new file for network utilities
export const FLOW_TESTNET = {
  chainId: "0x221", // 545 in hex
  chainName: "EVM on Flow Testnet",
  nativeCurrency: {
    name: "FLOW",
    symbol: "FLOW",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
  blockExplorerUrls: ["https://evm-testnet.flowscan.io"],
};

export async function setupNetwork() {
  try {
    // Request network switch
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: FLOW_TESTNET.chainId }],
    });
  } catch (switchError: any) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [FLOW_TESTNET],
        });
      } catch (addError) {
        throw new Error("Failed to add network to MetaMask");
      }
    } else {
      throw new Error("Failed to switch network");
    }
  }
}
