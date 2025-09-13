import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MemecoinConcept } from '@/types/memecoin';
import { useWallet } from '@/hooks/use-wallet';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { LaunchTokenButton } from '@/components/LaunchTokenButton';
import { AddLiquidityButton } from '@/components/AddLiquidityButton';
import { createAnchorClient } from '@/solana/anchorClient';
import { Star, TrendingUp, Users, MessageCircle, Send, Wallet, Loader2, CheckCircle, AlertTriangle, Rocket } from 'lucide-react';

interface LaunchModalProps {
  concept: MemecoinConcept | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LaunchModal = ({ concept, isOpen, onClose }: LaunchModalProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [launchResult, setLaunchResult] = useState<{
    mintAddress: string;
    txSig: string;
    recordTxSig?: string;
  } | null>(null);
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const solanaWallet = useSolanaWallet();

  const launchSteps = [
    'Creating SPL token',
    'Minting initial supply',
    'Recording launch on-chain',
    'Finalizing metadata',
    'Launch complete!',
  ];

  const handleTokenLaunchStarted = () => {
    setIsLaunching(true);
    setLaunchStep(0);
  };

  const handleTokenLaunchSuccess = async (mintAddress: string, txSig: string) => {
    setLaunchStep(1);
    
    try {
      // Try to record the launch on-chain using Anchor program
      if (process.env.VITE_SOLANA_PROGRAM_ID && process.env.VITE_SOLANA_PROGRAM_ID !== 'REPLACE_WITH_PROGRAM_ID_AFTER_DEPLOY') {
        setLaunchStep(2);
        const anchorClient = createAnchorClient(connection, solanaWallet);
        const recordResult = await anchorClient.recordLaunch(mintAddress);
        
        setLaunchResult({
          mintAddress,
          txSig,
          recordTxSig: recordResult.signature
        });
      } else {
        // Skip Anchor recording if program not deployed
        setLaunchResult({
          mintAddress,
          txSig
        });
      }
      
      setLaunchStep(3);
      
      // Complete the process
      setTimeout(() => {
        setLaunchStep(4);
        setIsLaunching(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to record launch on-chain:', error);
      // Still consider it successful if token was created
      setLaunchResult({
        mintAddress,
        txSig
      });
      setLaunchStep(4);
      setIsLaunching(false);
    }
  };

  const handleTokenLaunchError = (error: Error) => {
    console.error('Token launch failed:', error);
    setIsLaunching(false);
    setLaunchStep(0);
  };

  const resetLaunch = () => {
    setIsLaunching(false);
    setLaunchStep(0);
    setLaunchResult(null);
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
                    <span className="text-foreground font-mono">1,000,000 {concept.ticker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Decimals:</span>
                    <span className="text-foreground">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="text-foreground">Solana Devnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Standard:</span>
                    <span className="text-foreground">SPL Token</span>
                  </div>
                </div>
              </div>

              {/* Launch Success */}
              {launchResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-green-800">Token Launched Successfully!</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Mint Address:</span>
                      <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1 break-all">
                        {launchResult.mintAddress}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-green-700 font-medium">Transaction:</span>
                      <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1 break-all">
                        {launchResult.txSig}
                      </div>
                    </div>

                    {launchResult.recordTxSig && (
                      <div>
                        <span className="text-green-700 font-medium">On-chain Record:</span>
                        <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1 break-all">
                          {launchResult.recordTxSig}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <AddLiquidityButton 
                      mintAddress={launchResult.mintAddress}
                      tokenSymbol={concept.ticker}
                      className="flex-1"
                    />
                    <Button
                      onClick={resetLaunch}
                      variant="outline"
                      size="sm"
                    >
                      Launch Another
                    </Button>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-orange-800 font-semibold mb-1">Devnet Notice</div>
                    <div className="text-orange-700">
                      This will create a real SPL token on Solana devnet for testing purposes only. 
                      Devnet tokens have no monetary value.
                    </div>
                  </div>
                </div>
              </div>

              {/* Launch Component */}
              {!launchResult && (
                <div className="space-y-4">
                  {!solanaWallet.connected ? (
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">
                        Connect your Phantom wallet to launch this token on Solana devnet
                      </div>
                    </div>
                  ) : (
                    <LaunchTokenButton
                      name={concept.name}
                      symbol={concept.ticker}
                      supply={1000000}
                      decimals={6}
                      onStarted={handleTokenLaunchStarted}
                      onSuccess={handleTokenLaunchSuccess}
                      onError={handleTokenLaunchError}
                      disabled={isLaunching}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};