import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrendPoint {
  id: string;
  topic: string;
  memePotential: number;
  x: number;
  y: number;
  sources: Array<{
    type: string;
    content: string;
    engagement: string;
  }>;
}

interface TrendRadarProps {
  title: string;
  subtitle: string;
  trends: TrendPoint[];
}

export const TrendRadar: React.FC<TrendRadarProps> = ({ title, subtitle, trends }) => {
  const [selectedTrend, setSelectedTrend] = useState<TrendPoint | null>(null);

  const getRadarColor = (potential: number) => {
    if (potential >= 80) return 'bg-red-500';
    if (potential >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getPotentialLabel = (potential: number) => {
    if (potential >= 80) return 'High';
    if (potential >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Radar Background */}
          <div className="relative w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200 overflow-hidden">
            {/* Radar Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="radarGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#16a34a" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />
              {/* Radar circles */}
              <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#16a34a" strokeWidth="1" opacity="0.3"/>
              <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#16a34a" strokeWidth="1" opacity="0.3"/>
              <circle cx="50%" cy="50%" r="10%" fill="none" stroke="#16a34a" strokeWidth="1" opacity="0.3"/>
              {/* Radar sweep lines */}
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#16a34a" strokeWidth="1" opacity="0.3"/>
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#16a34a" strokeWidth="1" opacity="0.3"/>
            </svg>

            {/* Trend Points */}
            <TooltipProvider>
              {trends.map((trend) => (
                <Tooltip key={trend.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                        selectedTrend?.id === trend.id ? 'scale-125 z-10' : ''
                      }`}
                      style={{
                        left: `${trend.x}%`,
                        top: `${trend.y}%`,
                      }}
                      onClick={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
                    >
                      <div className={`w-4 h-4 rounded-full ${getRadarColor(trend.memePotential)} border-2 border-white shadow-lg`} />
                      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800 border shadow-sm">
                          {trend.topic}
                        </Badge>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2">
                      <p className="font-semibold">{trend.topic}</p>
                      <p className="text-sm">Meme Potential: {trend.memePotential}%</p>
                      <p className="text-xs text-gray-600">Click for details</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>

            {/* Center pulse animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-green-500/30 rounded-full animate-ping" />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>High (80%+)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span>Medium (60-79%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>Low (&lt;60%)</span>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Live Tracking
            </Badge>
          </div>

          {/* Selected Trend Details */}
          {selectedTrend && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">{selectedTrend.topic}</h4>
                <Badge className={`${getRadarColor(selectedTrend.memePotential)} text-white`}>
                  {getPotentialLabel(selectedTrend.memePotential)} ({selectedTrend.memePotential}%)
                </Badge>
              </div>
              <div className="space-y-1">
                {selectedTrend.sources.map((source, index) => (
                  <div key={index} className="text-xs text-green-700">
                    <span className="font-medium capitalize">{source.type}:</span> {source.content}
                    <span className="text-green-600 ml-1">({source.engagement})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};