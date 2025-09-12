import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { WalletModal } from '@/components/ui/wallet-modal';
import { useWallet } from '@/hooks/use-wallet';
import { Zap, TrendingUp, Bot, Rocket } from 'lucide-react';
import heroImage from '@/assets/hero-bg.jpg';

export const HeroSection = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { wallet } = useWallet();

  const stats = [
    { label: 'Memecoins Generated', value: '2,847', icon: Bot },
    { label: 'Active Traders', value: '15.2K', icon: TrendingUp },
    { label: 'Success Rate', value: '78%', icon: Zap },
    { label: 'Total Volume', value: '$12.4M', icon: Rocket },
  ];

  return (
    <>
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(13, 20, 33, 0.8), rgba(13, 20, 33, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-float" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-secondary rounded-full animate-glow" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary rounded-full animate-pulse" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-gradient-primary">AI Memecoin</span>
                <br />
                <span className="text-foreground">Launchpad</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Автоматическая генерация и запуск мемкоинов на основе глобальных трендов
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                size="lg"
                className="bg-gradient-primary text-primary-foreground border-0 hover:opacity-90 px-8 py-4 text-lg font-semibold glow-primary animate-pulse-glow"
              >
                {wallet.status === 'connected' ? 'Launch Token' : 'Connect Wallet'}
                <Rocket className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
                onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Marketplace
                <TrendingUp className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="crypto-card text-center animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};