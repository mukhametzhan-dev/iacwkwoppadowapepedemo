import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimplePhantomWallet } from '@/components/SimplePhantomWallet';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    return location.pathname === path;
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll
      window.location.href = `/#${sectionId}`;
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-card-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/pepehead.png" 
              alt="PepeLab Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PepeLab
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Home
            </Link>
            <button
              onClick={() => scrollToSection('agents')}
              className="text-foreground hover:text-primary transition-colors"
            >
              AI Agents
            </button>
            <button
              onClick={() => scrollToSection('marketplace')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Marketplace
            </button>
            <Link
              to="/dashboard"
              className={`transition-colors ${
                isActive('/dashboard') ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className={`transition-colors ${
                isActive('/analytics') ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Analytics
            </Link>
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
              <Link
                to="/"
                className={`block transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={() => scrollToSection('agents')}
                className="block text-foreground hover:text-primary transition-colors"
              >
                AI Agents
              </button>
              <button
                onClick={() => scrollToSection('marketplace')}
                className="block text-foreground hover:text-primary transition-colors"
              >
                Marketplace
              </button>
              <Link
                to="/dashboard"
                className={`block transition-colors ${
                  isActive('/dashboard') ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className={`block transition-colors ${
                  isActive('/analytics') ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              
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