import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemecoinConcept } from '@/types/memecoin';
import { Star, TrendingUp, Users, MessageCircle, Send, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MemecoinCardProps {
  concept: MemecoinConcept;
  onLaunch: (concept: MemecoinConcept) => void;
}

export const MemecoinCard = ({ concept, onLaunch }: MemecoinCardProps) => {
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-secondary text-secondary-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'High': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
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

  return (
    <div className="crypto-card group">
      {/* Header with badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <Badge className={getCategoryColor(concept.category)}>
            {concept.category}
          </Badge>
          <Badge className={getRiskColor(concept.riskLevel)}>
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

      {/* Meme Image Placeholder */}
      <div className="relative mb-4 overflow-hidden rounded-lg bg-gradient-card border border-card-border">
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-6xl opacity-50">🐸</div>
        </div>
        
        {/* Overlay with trend source */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-xs text-primary font-semibold truncate">
            {concept.trendSource}
          </div>
        </div>
      </div>

      {/* Token Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{concept.name}</h3>
          <p className="text-sm text-primary font-mono">${concept.ticker}</p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {concept.description}
        </p>

        {/* Price & Market Data */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/10 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Price</div>
            <div className="text-sm font-bold text-foreground">${formatPrice(concept.mockPrice)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Market Cap</div>
            <div className="text-sm font-bold text-primary">{formatMarketCap(concept.mockMarketCap)}</div>
          </div>
        </div>

        {/* Social Metrics */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>{concept.socialMetrics.twitterMentions.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{concept.socialMetrics.telegramMembers.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Send className="w-3 h-3" />
            <span>{concept.socialMetrics.redditPosts}</span>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Viral Potential</span>
            <span className="text-primary font-semibold">{concept.aiAnalysis.viralPotential}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-gradient-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${concept.aiAnalysis.viralPotential}%` }}
            />
          </div>
        </div>

        {/* Launch Button */}
        <Button
          onClick={() => onLaunch(concept)}
          className="w-full bg-gradient-primary text-primary-foreground border-0 hover:opacity-90 glow-primary"
        >
          Launch Now
          <TrendingUp className="ml-2 w-4 h-4" />
        </Button>

        {/* Created Time */}
        <div className="text-xs text-muted-foreground text-center">
          Created {formatDistanceToNow(concept.createdAt, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};