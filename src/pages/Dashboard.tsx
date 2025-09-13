import React from 'react';
import { Header } from '@/components/ui/header';
import { TrendRadar } from '@/components/TrendRadar';
import { ConceptCard } from '@/components/ConceptCard';
import { AnalyticsHub } from '@/components/AnalyticsHub';
import { LaunchCard } from '@/components/LaunchCard';
import dashboardData from '@/data/dashboard.json';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Dashboard Header */}
      <section className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Meme-Coin Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Visualize how meme-coins are generated from news and social media trends. 
              Track viral moments, analyze concepts, and launch tokens with data-driven insights.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Row 1 */}
            <div className="space-y-6 lg:space-y-0">
              <TrendRadar
                title={dashboardData.trendRadar.title}
                subtitle={dashboardData.trendRadar.subtitle}
                trends={dashboardData.trendRadar.trends}
              />
            </div>
            
            <div className="space-y-6 lg:space-y-0">
              <ConceptCard
                title={dashboardData.conceptShowcase.title}
                subtitle={dashboardData.conceptShowcase.subtitle}
                featured={dashboardData.conceptShowcase.featured}
              />
            </div>

            {/* Row 2 */}
            <div className="space-y-6 lg:space-y-0">
              <AnalyticsHub
                title={dashboardData.analyticsHub.title}
                subtitle={dashboardData.analyticsHub.subtitle}
                successfulCoins={dashboardData.analyticsHub.successfulCoins}
                insights={dashboardData.analyticsHub.insights}
              />
            </div>
            
            <div className="space-y-6 lg:space-y-0">
              <LaunchCard
                title={dashboardData.launchCard.title}
                subtitle={dashboardData.launchCard.subtitle}
                action={dashboardData.launchCard.action}
                description={dashboardData.launchCard.description}
                features={dashboardData.launchCard.features}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              🚀 How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  1
                </div>
                <div className="font-medium text-gray-800">Track Trends</div>
                <div className="text-gray-600">Monitor social media & news for viral meme potential</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  2
                </div>
                <div className="font-medium text-gray-800">Analyze Concepts</div>
                <div className="text-gray-600">AI evaluates risk, hype potential & market fit</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  3
                </div>
                <div className="font-medium text-gray-800">Compare Success</div>
                <div className="text-gray-600">Match patterns with successful Solana meme coins</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  4
                </div>
                <div className="font-medium text-gray-800">Launch Token</div>
                <div className="text-gray-600">Deploy validated concepts to Solana devnet</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;