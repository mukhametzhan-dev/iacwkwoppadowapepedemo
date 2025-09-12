import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { Loader2 } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const handleWalletSelect = async (walletType: 'phantom' | 'solflare' | 'backpack') => {
    try {
      await connectWallet(walletType);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const walletOptions = [
    {
      name: 'Phantom',
      id: 'phantom' as const,
      icon: '👻',
      description: 'Popular Solana wallet with great UX',
    },
    {
      name: 'Solflare',
      id: 'solflare' as const,
      icon: '☀️',
      description: 'Secure multi-platform wallet',
    },
    {
      name: 'Backpack',
      id: 'backpack' as const,
      icon: '🎒',
      description: 'Next-gen wallet for power users',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-card-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gradient-primary">
            {wallet.status === 'connected' ? 'Wallet Connected' : 'Connect Wallet'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {wallet.status === 'connected' ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-card rounded-lg border border-card-border">
                <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold mb-2">Successfully Connected</h3>
                <p className="text-sm text-muted-foreground">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-6)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Balance: {wallet.balance?.toFixed(2)} SOL
                </p>
              </div>
              
              <Button
                onClick={() => {
                  disconnectWallet();
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {walletOptions.map((walletOption) => (
                <Button
                  key={walletOption.id}
                  onClick={() => handleWalletSelect(walletOption.id)}
                  disabled={wallet.status === 'connecting'}
                  className="w-full h-auto p-4 bg-gradient-card hover:bg-gradient-card border border-card-border hover:border-primary/50 justify-start text-left transition-all duration-300"
                  variant="ghost"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="text-2xl">{walletOption.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{walletOption.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {walletOption.description}
                      </div>
                    </div>
                    {wallet.status === 'connecting' && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>
                </Button>
              ))}

              <div className="text-center text-xs text-muted-foreground mt-4 p-4 bg-muted/20 rounded-lg">
                ⚠️ This is a demo. No real wallet connection will be made.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};