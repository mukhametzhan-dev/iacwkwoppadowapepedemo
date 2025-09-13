import { Header } from '@/components/ui/header';
import { HeroSection } from '@/components/sections/hero-section';
import { AIAgentsSection } from '@/components/sections/ai-agents-section';
import { MarketplaceSection } from '@/components/sections/marketplace-section';
import { SimpleLaunchTokenButton } from '@/components/SimpleLaunchTokenButton';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      <HeroSection />
      
      {/* Solana Integration Demo Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient-primary mb-4">
              Token Launch Demo
            </h2>
            <p className="text-muted-foreground">
              Launch SPL tokens on Solana devnet using our backend API. No wallet connection required!
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">🚀 Launch Your Token</h3>
            <p className="text-muted-foreground mb-6">
              Create and deploy real SPL tokens on Solana devnet with automated liquidity pools.
              Choose from AI-generated templates or customize your own.
            </p>
            
            <SimpleLaunchTokenButton />
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>✨ Backend-powered token creation with real Solana transactions</p>
              <p>🔗 Automatic explorer links and liquidity pool setup</p>
              <p>🛡️ Secure devnet-only deployment</p>
            </div>
          </div>
        </div>
      </section>      <AIAgentsSection />
      <MarketplaceSection />
    </div>
  );
};

export default Index;
