import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PriceChart } from '@/components/PriceChart';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';

interface MemeData {
  id: string;
  name: string;
  symbol: string;
  mint: string;
  logo: string;
  tagline: string;
  createdAt: string;
  description: string;
  metrics: {
    marketCap: number;
    volume24h: number;
    tvl: number;
    change24h: number;
  };
  priceSeries: {
    '1D': Array<{ t: string; p: number }>;
    '7D': Array<{ t: string; p: number }>;
    '30D': Array<{ t: string; p: number }>;
    '90D': Array<{ t: string; p: number }>;
  };
}

interface MemeDetailProps {
  data: MemeData | null;
  isOpen: boolean;
  onClose: () => void;
}

type TimeRange = '1D' | '7D' | '30D' | '90D';

export const MemeDetail: React.FC<MemeDetailProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1D');
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { name, symbol, mint, logo, description, createdAt, metrics, priceSeries } = data;
  const isPositive = metrics.change24h > 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  const formatNumber = (num: number, prefix = '') => {
    if (num >= 1000000) {
      return `${prefix}${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(1)}K`;
    }
    return `${prefix}${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openExplorer = () => {
    window.open(`https://explorer.solana.com/address/${mint}?cluster=devnet`, '_blank');
  };

  const timeRanges: TimeRange[] = ['1D', '7D', '30D', '90D'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-8 h-8 rounded-full"
            />
            <span>{name} ({symbol})</span>
            <Badge variant="outline" className={changeColor}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}{metrics.change24h.toFixed(1)}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Price Chart</h3>
              <div className="flex space-x-1">
                {timeRanges.map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                    className="text-xs"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
            
            <PriceChart
              data={priceSeries[selectedTimeRange]}
              symbol={symbol}
              className="border rounded-lg p-4"
            />
          </div>

          {/* Metadata Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Token Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Mint Address</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                      {mint}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-500 mt-1">Copied!</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created
                  </label>
                  <p className="text-sm mt-1">{formatDate(createdAt)}</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{description}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Market Data</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Market Cap
                  </div>
                  <div className="font-semibold">
                    {formatNumber(metrics.marketCap, '$')}
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <Activity className="w-3 h-3 mr-1" />
                    24h Volume
                  </div>
                  <div className="font-semibold">
                    {formatNumber(metrics.volume24h, '$')}
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <Layers className="w-3 h-3 mr-1" />
                    TVL
                  </div>
                  <div className="font-semibold">
                    {formatNumber(metrics.tvl, '$')}
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    24h Change
                  </div>
                  <div className={`font-semibold ${changeColor}`}>
                    {isPositive ? '+' : ''}{metrics.change24h.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={openExplorer}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Solana Explorer
              </Button>
              
              <Button className="w-full">
                Add Liquidity
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};