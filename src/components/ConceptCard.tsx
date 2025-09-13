import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

interface ConceptData {
  name: string;
  symbol: string;
  description: string;
  risk: number;
  hype: number;
  logo: string;
  tags: string[];
  marketPotential: string;
  timeframe: string;
  sources: string[];
}

interface ConceptCardProps {
  title: string;
  subtitle: string;
  featured: ConceptData;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ title, subtitle, featured }) => {
  const getRiskColor = (risk: number) => {
    if (risk > 60) return 'text-red-600';
    if (risk > 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const getHypeColor = (hype: number) => {
    if (hype > 80) return 'text-green-600';
    if (hype > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Featured Concept */}
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{featured.logo}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{featured.name}</h3>
                  <p className="text-sm text-gray-600">${featured.symbol}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Featured
              </Badge>
            </div>

            <p className="text-sm text-gray-700 mb-4">{featured.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Risk</span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-bold ${getRiskColor(featured.risk)}`}>
                    {featured.risk}%
                  </span>
                </div>
                <Progress value={featured.risk} className="mt-2 h-2" />
              </div>

              <div className="bg-white/60 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Hype Potential</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-bold ${getHypeColor(featured.hype)}`}>
                    {featured.hype}%
                  </span>
                </div>
                <Progress value={featured.hype} className="mt-2 h-2" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {featured.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-green-600" />
                <span className="text-gray-600">Market:</span>
                <span className="font-medium">{featured.marketPotential}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-blue-600" />
                <span className="text-gray-600">Timeline:</span>
                <span className="font-medium">{featured.timeframe}</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800">Data Sources</h4>
            <div className="space-y-1">
              {featured.sources.map((source, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>{source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Hint */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">
                Concept ready for simulation • Click Launch to proceed
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};