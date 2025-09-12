import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MemecoinConcept } from '@/types/memecoin';
import { useWallet } from '@/hooks/use-wallet';
import { Star, TrendingUp, Users, MessageCircle, Send, Wallet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface LaunchModalProps {
  concept: MemecoinConcept | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LaunchModal = ({ concept, isOpen, onClose }: LaunchModalProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const { wallet } = useWallet();

  const launchSteps = [
    'Preparing smart contract',
    'Generating metadata',
    'Creating liquidity pool',
    'Deploying to Solana',
    'Initializing trading',
  ];

  const handleLaunch = async () => {
    if (wallet.status !== 'connected') {
      return;
    }

    setIsLaunching(true);
    
    // Simulate launch process
    for (let i = 0; i <= launchSteps.length; i++) {
      setLaunchStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Reset after completion
    setTimeout(() => {
      setIsLaunching(false);
      setLaunchStep(0);
      onClose();
    }, 2000);
  };

  if (!concept) return null;

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toExponential(2);
    }
    return price.toFixed(6);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
    if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Tech: 'bg-primary text-primary-foreground',
      Politics: 'bg-destructive text-destructive-foreground',
      Entertainment: 'bg-accent text-accent-foreground',
      Sports: 'bg-secondary text-secondary-foreground',
      Crypto: 'bg-primary text-primary-foreground',
      Memes: 'bg-accent text-accent-foreground',
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-secondary';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gradient-primary">
            Launch Token
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Launch Progress */}
          {isLaunching && (
            <div className="bg-gradient-card border border-card-border rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold text-foreground mb-2">
                  Launching {concept.name}...
                </div>
                <Progress value={(launchStep / launchSteps.length) * 100} className="w-full" />
              </div>

              <div className="space-y-2">
                {launchSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {index < launchStep ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : index === launchStep ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted rounded-full" />
                    )}
                    <span className={`text-sm ${
                      index <= launchStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {launchStep > launchSteps.length && (
                <div className="text-center mt-4 p-4 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-lg font-semibold text-primary">Token Launched Successfully!</div>
                  <div className="text-sm text-muted-foreground">Contract: 7xKXtg...sgAsU</div>
                </div>
              )}
            </div>
          )}

          {/* Token Overview */}
          {!isLaunching && (
            <>
              {/* Header with badges */}
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(concept.category)}>
                    {concept.category}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(concept.riskLevel)}>
                    {concept.riskLevel} Risk
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < concept.potentialRating
                          ? 'text-accent fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Token Details */}
              <div className="bg-gradient-card border border-card-border rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{concept.name}</h3>
                  <p className="text-lg text-primary font-mono">${concept.ticker}</p>
                  <p className="text-sm text-muted-foreground mt-2">{concept.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/10 rounded-lg">
                    <div className="text-sm text-muted-foreground">Initial Price</div>
                    <div className="text-lg font-bold text-foreground">${formatPrice(concept.mockPrice)}</div>
                  </div>
                  <div className="text-center p-4 bg-muted/10 rounded-lg">
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="text-lg font-bold text-primary">{formatMarketCap(concept.mockMarketCap)}</div>
                  </div>
                </div>

                {/* Trend Source */}
                <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-primary font-semibold mb-1">TREND SOURCE</div>
                  <div className="text-foreground">{concept.trendSource}</div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-gradient-card border border-card-border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">AI Market Analysis</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Viral Potential</span>
                      <span className="text-primary font-semibold">{concept.aiAnalysis.viralPotential}%</span>
                    </div>
                    <Progress value={concept.aiAnalysis.viralPotential} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Community Interest</span>
                      <span className="text-accent font-semibold">{concept.aiAnalysis.communityInterest}%</span>
                    </div>
                    <Progress value={concept.aiAnalysis.communityInterest} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Market Timing</span>
                      <span className="text-secondary font-semibold">{concept.aiAnalysis.marketTiming}%</span>
                    </div>
                    <Progress value={concept.aiAnalysis.marketTiming} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Social Metrics */}
              <div className="bg-gradient-card border border-card-border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Social Engagement</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <MessageCircle className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">
                      {concept.socialMetrics.twitterMentions.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Twitter</div>
                  </div>
                  
                  <div className="text-center">
                    <Send className="w-6 h-6 text-accent mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">
                      {concept.socialMetrics.redditPosts.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Reddit</div>
                  </div>
                  
                  <div className="text-center">
                    <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <div className="text-lg font-bold text-foreground">
                      {concept.socialMetrics.telegramMembers.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Telegram</div>
                  </div>
                </div>
              </div>

              {/* Launch Parameters */}
              <div className="bg-gradient-card border border-card-border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Launch Parameters</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supply:</span>
                    <span className="text-foreground font-mono">1,000,000,000 {concept.ticker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Liquidity:</span>
                    <span className="text-foreground">10 SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Launch Fee:</span>
                    <span className="text-foreground">0.5 SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator Allocation:</span>
                    <span className="text-foreground">5%</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-warning/10 border border-warning rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <div className="text-warning font-semibold mb-1">Investment Warning</div>
                    <div className="text-muted-foreground">
                      Memecoins are highly speculative and volatile. Only invest what you can afford to lose.
                      This is a demo and no real tokens will be created.
                    </div>
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <div className="space-y-4">
                {wallet.status !== 'connected' ? (
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Connect your wallet to launch this token
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleLaunch}
                    className="w-full bg-gradient-primary text-primary-foreground border-0 hover:opacity-90 py-4 text-lg font-semibold glow-primary"
                  >
                    Launch {concept.name}
                    <TrendingUp className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};