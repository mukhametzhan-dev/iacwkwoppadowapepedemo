import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Copy, CheckCircle } from 'lucide-react';

interface PhantomWallet {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  publicKey: { toString: () => string } | null;
}

declare global {
  interface Window {
    solana?: any;
  }
}

export const SimplePhantomWallet: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if wallet is connected on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      const savedWallet = localStorage.getItem('phantom_wallet_address');
      
      if (savedWallet) {
        // Always restore from localStorage if address exists
        setPublicKey(savedWallet);
        setIsConnected(true);
        await fetchBalance(savedWallet);
        
        // Try to reconnect silently if Phantom is available
        if (window.solana) {
          try {
            // Check if still connected or try silent connect
            if (window.solana.isConnected || window.solana.publicKey) {
              // Already connected, use current state
              const currentAddress = window.solana.publicKey?.toString();
              if (currentAddress && currentAddress !== savedWallet) {
                // Address changed, update localStorage
                setPublicKey(currentAddress);
                localStorage.setItem('phantom_wallet_address', currentAddress);
                await fetchBalance(currentAddress);
              }
            } else {
              // Try silent connection (only works if previously authorized)
              try {
                await window.solana.connect({ onlyIfTrusted: true });
                const address = window.solana.publicKey?.toString();
                if (address) {
                  setPublicKey(address);
                  localStorage.setItem('phantom_wallet_address', address);
                  await fetchBalance(address);
                }
              } catch (silentError) {
                // Silent connection failed, but keep localStorage state
                console.log('Silent connection failed, using localStorage state');
              }
            }
          } catch (error) {
            console.log('Wallet check failed, using localStorage state');
          }
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    const handleAccountChange = (publicKey: any) => {
      if (publicKey) {
        const address = publicKey.toString();
        setPublicKey(address);
        setIsConnected(true);
        localStorage.setItem('phantom_wallet_address', address);
        fetchBalance(address);
      } else {
        // Account disconnected
        setIsConnected(false);
        setPublicKey(null);
        setBalance(null);
        localStorage.removeItem('phantom_wallet_address');
      }
    };

    // Add event listeners if Phantom is available
    if (window.solana) {
      window.solana.on('accountChanged', handleAccountChange);
      window.solana.on('disconnect', () => {
        setIsConnected(false);
        setPublicKey(null);
        setBalance(null);
        localStorage.removeItem('phantom_wallet_address');
      });
    }

    // Cleanup event listeners
    return () => {
      if (window.solana) {
        try {
          window.solana.removeListener('accountChanged', handleAccountChange);
          window.solana.removeListener('disconnect');
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const fetchBalance = async (address: string) => {
    try {
      // Simple fetch to get SOL balance from devnet
      const response = await fetch(`https://api.devnet.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });
      
      const data = await response.json();
      if (data.result) {
        // Convert lamports to SOL (1 SOL = 1 billion lamports)
        const solBalance = data.result.value / 1000000000;
        setBalance(solBalance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(0);
    }
  };

  const connectWallet = async () => {
    if (!window.solana) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      setIsLoading(true);
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      
      setPublicKey(address);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem('phantom_wallet_address', address);
      
      // Fetch balance
      await fetchBalance(address);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
      }
      
      setIsConnected(false);
      setPublicKey(null);
      setBalance(null);
      
      // Clear localStorage
      localStorage.removeItem('phantom_wallet_address');
      
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2 bg-purple-500 text-white border-purple-500 hover:bg-purple-600 hover:border-purple-600"
      >
        <Wallet className="w-4 h-4" />
        {isLoading ? 'Connecting...' : 'Connect Phantom'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono text-slate-900 dark:text-white">
              {publicKey ? formatAddress(publicKey) : 'Unknown'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-5 w-5 p-0"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
          </div>
        </div>
      </div>
      
      <Button
        onClick={disconnectWallet}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};