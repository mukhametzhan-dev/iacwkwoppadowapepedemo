import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemecoinCard } from '@/components/ui/memecoin-card';
import { SimpleLaunchTokenModal } from '@/components/SimpleLaunchTokenModal';
import { mockMemecoinConcepts, getRandomConcept } from '@/data/mockData';
import { MemecoinConcept } from '@/types/memecoin';
import { Grid, List, Filter, Plus, Sparkles } from 'lucide-react';

export const MarketplaceSection = () => {
  const [concepts, setConcepts] = useState(mockMemecoinConcepts);
  const [selectedConcept, setSelectedConcept] = useState<MemecoinConcept | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const handleLaunch = (concept: MemecoinConcept) => {
    setSelectedConcept(concept);
    setIsModalOpen(true);
  };

  const generateNewConcept = () => {
    const newConcept = getRandomConcept();
    setConcepts([newConcept, ...concepts]);
  };

  const filteredAndSortedConcepts = concepts
    .filter(concept => {
      if (filterCategory !== 'all' && concept.category !== filterCategory) return false;
      if (filterRisk !== 'all' && concept.riskLevel !== filterRisk) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'potential':
          return b.potentialRating - a.potentialRating;
        case 'marketcap':
          return b.mockMarketCap - a.mockMarketCap;
        case 'viral':
          return b.aiAnalysis.viralPotential - a.aiAnalysis.viralPotential;
        default:
          return 0;
      }
    });

  return (
    <>
      <section id="marketplace" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Memecoin <span className="text-gradient-primary">Marketplace</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Исследуйте AI-генерированные концепции мемкоинов и запускайте следующий вирусный токен
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 space-y-4">
            {/* Top Row - Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateNewConcept}
                className="bg-gradient-accent text-accent-foreground border-0 hover:opacity-90 glow-accent"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Concept
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters:</span>
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Tech">Tech</SelectItem>
                    <SelectItem value="Politics">Politics</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="Memes">Memes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort and View */}
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="potential">Potential</SelectItem>
                    <SelectItem value="marketcap">Market Cap</SelectItem>
                    <SelectItem value="viral">Viral Score</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-card-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredAndSortedConcepts.length} concepts
          </div>

          {/* Marketplace Grid/List */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredAndSortedConcepts.map((concept, index) => (
              <div 
                key={concept.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MemecoinCard
                  concept={concept}
                  onLaunch={handleLaunch}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedConcepts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No concepts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or generate a new concept
              </p>
              <Button
                onClick={generateNewConcept}
                className="bg-gradient-primary text-primary-foreground border-0 hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Concept
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Launch Modal */}
      <SimpleLaunchTokenModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={selectedConcept ? {
          name: selectedConcept.name,
          symbol: selectedConcept.ticker,
          description: selectedConcept.description,
        } : undefined}
      >
        <div style={{ display: 'none' }} />
      </SimpleLaunchTokenModal>
    </>
  );
};