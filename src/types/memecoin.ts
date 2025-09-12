export interface MemecoinConcept {
  id: string;
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  trendSource: string;
  potentialRating: 1 | 2 | 3 | 4 | 5;
  riskLevel: 'Low' | 'Medium' | 'High';
  category: 'Tech' | 'Politics' | 'Entertainment' | 'Sports' | 'Crypto' | 'Memes';
  mockPrice: number;
  mockMarketCap: number;
  mockVolume24h: number;
  createdAt: Date;
  socialMetrics: {
    twitterMentions: number;
    redditPosts: number;
    telegramMembers: number;
  };
  aiAnalysis: {
    viralPotential: number;
    communityInterest: number;
    marketTiming: number;
  };
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Processing' | 'Idle';
  lastActivity: string;
  tasksCompleted: number;
  currentTask?: string;
  icon: string;
}

export type WalletStatus = 'disconnected' | 'connecting' | 'connected';

export interface WalletState {
  status: WalletStatus;
  address?: string;
  balance?: number;
  walletType?: 'phantom' | 'solflare' | 'backpack';
}