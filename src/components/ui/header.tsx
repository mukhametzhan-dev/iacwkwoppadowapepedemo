import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WalletModal } from '@/components/ui/wallet-modal';
import { Wallet, Menu, X } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

export const Header = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-glow">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gradient-primary">PepeLab.me</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#agents" className="text-foreground hover:text-primary transition-colors">
              AI Agents
            </a>
            <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </a>
            <a href="#analytics" className="text-foreground hover:text-primary transition-colors">
              Analytics
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {wallet.status === 'connected' ? (
              <div className="hidden md:flex items-center space-x-3 bg-card border border-card-border rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                <span className="text-sm font-medium">{formatAddress(wallet.address!)}</span>
                <span className="text-xs text-muted-foreground">
                  {wallet.balance?.toFixed(2)} SOL
                </span>
              </div>
            ) : (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                variant="outline"
                size="sm"
                className="hidden md:flex bg-gradient-primary text-primary-foreground border-0 hover:opacity-90"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-card-border">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a href="#home" className="block text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="#agents" className="block text-foreground hover:text-primary transition-colors">
                AI Agents
              </a>
              <a href="#marketplace" className="block text-foreground hover:text-primary transition-colors">
                Marketplace
              </a>
              <a href="#analytics" className="block text-foreground hover:text-primary transition-colors">
                Analytics
              </a>
              
              {wallet.status === 'connected' ? (
                <div className="flex items-center space-x-3 bg-card border border-card-border rounded-lg px-4 py-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                  <span className="text-sm font-medium">{formatAddress(wallet.address!)}</span>
                  <span className="text-xs text-muted-foreground">
                    {wallet.balance?.toFixed(2)} SOL
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full bg-gradient-primary text-primary-foreground border-0 hover:opacity-90"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};