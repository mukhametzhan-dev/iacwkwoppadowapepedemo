import { MemecoinConcept, AIAgent } from '@/types/memecoin';

export const mockMemecoinConcepts: MemecoinConcept[] = [
  {
    id: '1',
    name: 'ElonDogeMars',
    ticker: 'EDM',
    description: 'AI-generated meme combining Elon Musk tweet about Mars colonization with Doge energy',
    imageUrl: '/api/placeholder/300/300',
    trendSource: 'Based on @elonmusk tweet about Mars',
    potentialRating: 5,
    riskLevel: 'Medium',
    category: 'Tech',
    mockPrice: 0.0000234,
    mockMarketCap: 2340000,
    mockVolume24h: 180000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    socialMetrics: {
      twitterMentions: 15600,
      redditPosts: 342,
      telegramMembers: 5200,
    },
    aiAnalysis: {
      viralPotential: 94,
      communityInterest: 88,
      marketTiming: 91,
    },
  },
  {
    id: '2',
    name: 'AIOverlord',
    ticker: 'OVERLRD',
    description: 'Generated from trending AI debate on Twitter - "Will AI rule the world?"',
    imageUrl: '/api/placeholder/300/300',
    trendSource: 'Based on trending #AI hashtag',
    potentialRating: 4,
    riskLevel: 'High',
    category: 'Tech',
    mockPrice: 0.000891,
    mockMarketCap: 8910000,
    mockVolume24h: 420000,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    socialMetrics: {
      twitterMentions: 8900,
      redditPosts: 156,
      telegramMembers: 3400,
    },
    aiAnalysis: {
      viralPotential: 76,
      communityInterest: 82,
      marketTiming: 89,
    },
  },
  {
    id: '3',
    name: 'PepePolitics',
    ticker: 'POLPEPE',
    description: 'Trending political meme fusion with classic Pepe format',
    imageUrl: '/api/placeholder/300/300',
    trendSource: 'Based on political Twitter trends',
    potentialRating: 3,
    riskLevel: 'Low',
    category: 'Politics',
    mockPrice: 0.00156,
    mockMarketCap: 1560000,
    mockVolume24h: 89000,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    socialMetrics: {
      twitterMentions: 4200,
      redditPosts: 89,
      telegramMembers: 1800,
    },
    aiAnalysis: {
      viralPotential: 65,
      communityInterest: 71,
      marketTiming: 68,
    },
  },
  {
    id: '4',
    name: 'CryptoFrog',
    ticker: 'CFROG',
    description: 'Bull market celebration meme with frog mascot riding Bitcoin rocket',
    imageUrl: '/api/placeholder/300/300',
    trendSource: 'Based on crypto pump trends',
    potentialRating: 5,
    riskLevel: 'Medium',
    category: 'Crypto',
    mockPrice: 0.000045,
    mockMarketCap: 450000,
    mockVolume24h: 67000,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    socialMetrics: {
      twitterMentions: 12000,
      redditPosts: 234,
      telegramMembers: 4100,
    },
    aiAnalysis: {
      viralPotential: 87,
      communityInterest: 93,
      marketTiming: 85,
    },
  },
  {
    id: '5',
    name: 'GigaChad',
    ticker: 'GIGA',
    description: 'Chad meme meets crypto gains - for ultimate alpha energy',
    imageUrl: '/api/placeholder/300/300',
    trendSource: 'Based on trending fitness content',
    potentialRating: 4,
    riskLevel: 'Low',
    category: 'Memes',
    mockPrice: 0.00234,
    mockMarketCap: 2340000,
    mockVolume24h: 156000,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    socialMetrics: {
      twitterMentions: 7800,
      redditPosts: 167,
      telegramMembers: 2900,
    },
    aiAnalysis: {
      viralPotential: 78,
      communityInterest: 84,
      marketTiming: 72,
    },
  },
  {
    id: '6',
    name: 'SportsMeme',
    ticker: 'SPORT',
    description: 'Viral sports moment turned into investment opportunity',
    imageUrl: '/api/placeholder/300/300',
    trendSource: 'Based on trending sports clips',
    potentialRating: 2,
    riskLevel: 'High',
    category: 'Sports',
    mockPrice: 0.000012,
    mockMarketCap: 120000,
    mockVolume24h: 23000,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    socialMetrics: {
      twitterMentions: 2100,
      redditPosts: 45,
      telegramMembers: 890,
    },
    aiAnalysis: {
      viralPotential: 45,
      communityInterest: 38,
      marketTiming: 52,
    },
  },
];

export const mockAIAgents: AIAgent[] = [
  {
    id: 'analyst',
    name: 'Trend Analyst',
    role: 'Monitors global trends across social platforms',
    status: 'Active',
    lastActivity: 'Analyzing Twitter trends',
    tasksCompleted: 1247,
    currentTask: 'Scanning 50k tweets for emerging memes',
    icon: 'TrendingUp',
  },
  {
    id: 'creator',
    name: 'Concept Creator',
    role: 'Generates memecoin concepts from trends',
    status: 'Processing',
    lastActivity: 'Creating new concept',
    tasksCompleted: 342,
    currentTask: 'Generating concept for #AI trend',
    icon: 'Lightbulb',
  },
  {
    id: 'designer',
    name: 'Meme Designer',
    role: 'Creates viral meme images and branding',
    status: 'Active',
    lastActivity: 'Designing meme assets',
    tasksCompleted: 876,
    currentTask: 'Creating logo for ElonDogeMars',
    icon: 'Palette',
  },
  {
    id: 'developer',
    name: 'Smart Contract Dev',
    role: 'Deploys tokens on Solana blockchain',
    status: 'Idle',
    lastActivity: 'Deployed CryptoFrog token',
    tasksCompleted: 234,
    icon: 'Code',
  },
  {
    id: 'marketer',
    name: 'Growth Hacker',
    role: 'Simulates trading and builds momentum',
    status: 'Active',
    lastActivity: 'Running growth campaign',
    tasksCompleted: 567,
    currentTask: 'Boosting EDM social presence',
    icon: 'TrendingUp',
  },
];

export const getRandomConcept = (): MemecoinConcept => {
  const names = ['MegaPepe', 'DiamondHands', 'MoonRocket', 'GigaBull', 'AlphaWolf'];
  const tickers = ['MEGA', 'DIAMOND', 'MOON', 'BULL', 'ALPHA'];
  const categories: MemecoinConcept['category'][] = ['Tech', 'Politics', 'Entertainment', 'Sports', 'Crypto', 'Memes'];
  
  const randomIndex = Math.floor(Math.random() * names.length);
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: names[randomIndex],
    ticker: tickers[randomIndex],
    description: `AI-generated concept based on trending ${category.toLowerCase()} content`,
    imageUrl: '/api/placeholder/300/300',
    trendSource: `Based on trending #${category} hashtag`,
    potentialRating: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
    riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
    category,
    mockPrice: Math.random() * 0.01,
    mockMarketCap: Math.floor(Math.random() * 10000000),
    mockVolume24h: Math.floor(Math.random() * 500000),
    createdAt: new Date(),
    socialMetrics: {
      twitterMentions: Math.floor(Math.random() * 20000),
      redditPosts: Math.floor(Math.random() * 500),
      telegramMembers: Math.floor(Math.random() * 10000),
    },
    aiAnalysis: {
      viralPotential: Math.floor(Math.random() * 40) + 60,
      communityInterest: Math.floor(Math.random() * 40) + 60,
      marketTiming: Math.floor(Math.random() * 40) + 60,
    },
  };
};