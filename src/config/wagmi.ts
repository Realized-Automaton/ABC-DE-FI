
'use client'; // Ensure this runs on the client

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains'; // Add desired chains
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn("WalletConnect project ID not found in environment variables. WalletConnect functionality will be limited.");
  // Optionally throw an error if WalletConnect is strictly required:
  // throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable");
}

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia], // Define the chains your app supports
  connectors: [
    injected(), // Browser Wallet (like MetaMask, Rabby)
    walletConnect({ projectId: projectId || "" }), // Use || "" to handle undefined case if not strictly required
    metaMask(), // Explicit MetaMask connector
    safe(), // Safe Wallet connector
  ],
  ssr: true, // Enable SSR support
  transports: {
    [mainnet.id]: http(), // Use default public RPC for Mainnet
    [sepolia.id]: http(), // Use default public RPC for Sepolia
  },
});
