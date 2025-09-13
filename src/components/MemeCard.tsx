import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkline } from '@/components/Sparkline';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MemeData {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  tagline: string;
  metrics: {
    change24h: number;
  };
  priceSeries: {
    '1D': Array<{ t: string; p: number }>;
  };
}

interface MemeCardProps {
  data: MemeData;
  onClick: () => void;
  className?: string;
}

export const MemeCard: React.FC<MemeCardProps> = ({
  data,
  onClick,
  className = '',
}) => {
  const { name, symbol, logo, tagline, metrics, priceSeries } = data;
  const isPositive = metrics.change24h > 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const sparklineColor = isPositive ? '#00D26A' : '#EF4444';

  // Use last 12 points from 1D data for sparkline
  const sparklineData = priceSeries['1D'].slice(-12);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${name} (${symbol})`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{symbol}</h3>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{metrics.change24h.toFixed(1)}%
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{tagline}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">24h Change</span>
            <span className={`text-xs font-medium ${changeColor}`}>
              {isPositive ? '+' : ''}{metrics.change24h.toFixed(1)}%
            </span>
          </div>
          
          <div className="mt-3">
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
              className="opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Click to view details →
          </span>
        </div>
      </CardContent>
    </Card>
  );
};