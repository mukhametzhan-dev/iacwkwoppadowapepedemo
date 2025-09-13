import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { MemeCard } from '@/components/MemeCard';
import { MemeDetail } from '@/components/MemeDetail';
import analyticsData from '@/data/analytics-memes.json';

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

const Analytics = () => {
  const [selectedMeme, setSelectedMeme] = useState<MemeData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const memeData: MemeData[] = analyticsData as MemeData[];

  // Handle deep linking with URL hash or query params
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const coinParam = urlParams.get('coin');
    
    let targetCoin = null;
    
    if (hash.includes('=')) {
      // Handle #analytics=trump format
      targetCoin = hash.split('=')[1];
    } else if (coinParam) {
      // Handle ?coin=trump format
      targetCoin = coinParam;
    }
    
    if (targetCoin) {
      const meme = memeData.find(m => m.id === targetCoin);
      if (meme) {
        setSelectedMeme(meme);
        setIsDetailOpen(true);
      }
    }
  }, []);

  const handleMemeClick = (meme: MemeData) => {
    setSelectedMeme(meme);
    setIsDetailOpen(true);
    
    // Update URL for deep linking
    const newUrl = `${window.location.pathname}?coin=${meme.id}`;
    window.history.pushState({ coin: meme.id }, '', newUrl);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedMeme(null);
    
    // Remove coin param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('coin');
    window.history.pushState({}, '', url.pathname + url.hash);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      {/* Analytics Section */}
      <section id="analytics" className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Meme Analytics
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track trending meme coins on Solana devnet. Real-time price data, 
              market metrics, and interactive charts for the hottest tokens.
            </p>
          </div>

          {/* Meme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {memeData.map((meme) => (
              <MemeCard
                key={meme.id}
                data={meme}
                onClick={() => handleMemeClick(meme)}
                className="h-full"
              />
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-card/50 backdrop-blur-sm border border-card-border rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-3">🔍 Analytics Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <span className="text-primary mr-2">📊</span>
                  Interactive price charts
                </div>
                <div className="flex items-center">
                  <span className="text-primary mr-2">📈</span>
                  Multiple timeframes
                </div>
                <div className="flex items-center">
                  <span className="text-primary mr-2">💰</span>
                  Market cap & volume data
                </div>
                <div className="flex items-center">
                  <span className="text-primary mr-2">🔗</span>
                  Solana Explorer links
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <MemeDetail
        data={selectedMeme}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
      />
    </div>
  );
};

export default Analytics;