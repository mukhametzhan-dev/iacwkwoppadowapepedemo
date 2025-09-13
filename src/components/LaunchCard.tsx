import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, Shield, BarChart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LaunchCardProps {
  title: string;
  subtitle: string;
  action: string;
  description: string;
  features: string[];
}

export const LaunchCard: React.FC<LaunchCardProps> = ({ 
  title, 
  subtitle, 
  action, 
  description, 
  features 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [launched, setLaunched] = useState(false);
  const navigate = useNavigate();

  const handleLaunch = () => {
    setIsLoading(true);
    
    // Simulate launch process
    setTimeout(() => {
      setIsLoading(false);
      setLaunched(true);
      
      // Navigate to launch page with concept parameter
      setTimeout(() => {
        navigate('/launch?concept=moonfrog');
      }, 1500);
    }, 2000);
  };

  const featureIcons = [
    <CheckCircle className="w-3 h-3 text-green-600" />,
    <Zap className="w-3 h-3 text-blue-600" />,
    <BarChart className="w-3 h-3 text-purple-600" />,
    <Shield className="w-3 h-3 text-orange-600" />,
  ];

  if (launched) {
    return (
      <Card className="h-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
        <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="text-6xl animate-bounce">🚀</div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-800">Launch Successful!</h3>
            <p className="text-sm text-green-600">Redirecting to launch dashboard...</p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Launch Button */}
          <div className="text-center space-y-4">
            <div className="relative">
              <Button
                onClick={handleLaunch}
                disabled={isLoading}
                className="w-full h-16 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Launching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Rocket className="w-6 h-6" />
                    <span>{action}</span>
                  </div>
                )}
              </Button>
              
              {/* Pulse effect when not loading */}
              {!isLoading && (
                <div className="absolute inset-0 bg-green-500 rounded-xl opacity-25 animate-ping" />
              )}
            </div>
            
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Launch Features</h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  {featureIcons[index]}
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">System Status</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                All Systems Ready
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">Solana RPC</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">Token Factory</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">Metadata API</span>
              </div>
            </div>
          </div>

          {/* Launch Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="text-lg font-bold text-blue-700">847</div>
              <div className="text-xs text-gray-600">Successful Launches</div>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <div className="text-lg font-bold text-purple-700">2.3s</div>
              <div className="text-xs text-gray-600">Avg Launch Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};