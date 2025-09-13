import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Lightbulb } from 'lucide-react';

interface SuccessfulCoin {
  name: string;
  symbol: string;
  successScore: number;
  marketCap: string;
  launched: string;
  similarity: string;
  color: string;
}

interface AnalyticsHubProps {
  title: string;
  subtitle: string;
  successfulCoins: SuccessfulCoin[];
  insights: string[];
}

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({ 
  title, 
  subtitle, 
  successfulCoins, 
  insights 
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Success Scores */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-800">Success Similarity Scores</h4>
            </div>
            
            {successfulCoins.map((coin, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: coin.color }}
                    />
                    <div>
                      <span className="font-medium text-gray-900">{coin.symbol}</span>
                      <span className="text-xs text-gray-500 ml-2">{coin.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{coin.successScore}%</span>
                    <div className="text-xs text-gray-500">{coin.marketCap}</div>
                  </div>
                </div>
                
                <Progress 
                  value={coin.successScore} 
                  className="h-2"
                  style={{
                    background: `linear-gradient(to right, ${coin.color}, ${coin.color}50)`
                  }}
                />
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Launched: {coin.launched}</span>
                  <Badge variant="outline" className="text-xs">
                    {coin.similarity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Market Insights */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <h4 className="text-sm font-semibold text-gray-800">Key Insights</h4>
            </div>
            
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-green-700">76%</div>
                <div className="text-xs text-gray-600">Avg Success</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">$2.1B</div>
                <div className="text-xs text-gray-600">Peak Cap</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-700">4.2x</div>
                <div className="text-xs text-gray-600">Avg Return</div>
              </div>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Real-time analysis</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Updated 2m ago
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};