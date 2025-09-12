import { create } from 'zustand';
import { WalletState, WalletStatus } from '@/types/memecoin';

interface WalletStore {
  wallet: WalletState;
  connectWallet: (walletType: 'phantom' | 'solflare' | 'backpack') => Promise<void>;
  disconnectWallet: () => void;
}

export const useWallet = create<WalletStore>((set, get) => ({
  wallet: {
    status: 'disconnected' as WalletStatus,
  },

  connectWallet: async (walletType) => {
    set({ 
      wallet: { 
        ...get().wallet, 
        status: 'connecting' 
      } 
    });

    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful connection
    const mockAddresses = {
      phantom: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      solflare: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      backpack: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy',
    };

    const mockBalances = {
      phantom: 12.45,
      solflare: 8.92,
      backpack: 25.67,
    };

    set({
      wallet: {
        status: 'connected',
        address: mockAddresses[walletType],
        balance: mockBalances[walletType],
        walletType,
      },
    });
  },

  disconnectWallet: () => {
    set({
      wallet: {
        status: 'disconnected',
      },
    });
  },
}));