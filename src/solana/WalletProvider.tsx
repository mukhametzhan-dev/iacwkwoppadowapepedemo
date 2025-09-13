import * as React from "react";
import { FC, ReactNode, useMemo, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPreferredWallet, setPreferredWallet } from "@/hooks/useWalletPersistence";
import "@solana/wallet-adapter-react-ui/styles.css";

// Inner component to handle wallet selection persistence
const WalletPersistenceHandler: FC<{ children: ReactNode }> = ({ children }) => {
  const { wallet, connected } = useWallet();

  useEffect(() => {
    if (connected && wallet?.adapter?.name) {
      setPreferredWallet(wallet.adapter.name);
    }
  }, [connected, wallet?.adapter?.name]);

  return <>{children}</>;
};

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = "https://api.devnet.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  
  // Check if user has a preferred wallet for auto-connect
  const preferredWallet = getPreferredWallet();
  const autoConnect = Boolean(preferredWallet);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>
          <WalletPersistenceHandler>
            {children}
          </WalletPersistenceHandler>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;