import { Header } from '@/components/ui/header';
import { HeroSection } from '@/components/sections/hero-section';
import { AIAgentsSection } from '@/components/sections/ai-agents-section';
import { MarketplaceSection } from '@/components/sections/marketplace-section';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      <HeroSection />
      <AIAgentsSection />
      <MarketplaceSection />
    </div>
  );
};

export default Index;
