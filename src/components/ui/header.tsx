import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimplePhantomWallet } from '@/components/SimplePhantomWallet';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/pepe-logo.png" 
              alt="PepeLab Logo" 
              className="h-16 w-auto object-contain bg-white/90 dark:bg-white/95 rounded-lg px-3 py-1 shadow-sm"
            />
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
            <div className="hidden md:flex">
              <SimplePhantomWallet />
            </div>

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
              
              {/* Mobile Wallet Connection */}
              <div className="pt-4 border-t border-card-border">
                <SimplePhantomWallet />
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};