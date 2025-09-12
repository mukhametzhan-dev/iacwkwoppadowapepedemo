import { mockAIAgents } from '@/data/mockData';
import { TrendingUp, Lightbulb, Palette, Code, BarChart3 } from 'lucide-react';
import analystImage from '@/assets/ai-analyst.jpg';
import creatorImage from '@/assets/ai-creator.jpg';
import designerImage from '@/assets/ai-designer.jpg';
import developerImage from '@/assets/ai-developer.jpg';
import marketerImage from '@/assets/ai-marketer.jpg';

const iconMap = {
  TrendingUp,
  Lightbulb,
  Palette,
  Code,
  BarChart3,
};

const imageMap = {
  analyst: analystImage,
  creator: creatorImage,
  designer: designerImage,
  developer: developerImage,
  marketer: marketerImage,
};

export const AIAgentsSection = () => {
  return (
    <section id="agents" className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-primary">AI Agents</span> Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Пять специализированных ИИ-агентов работают 24/7, анализируя тренды, создавая концепции и запуская мемкоины
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockAIAgents.map((agent, index) => {
            const IconComponent = iconMap[agent.icon as keyof typeof iconMap] || TrendingUp;
            const agentImage = imageMap[agent.id as keyof typeof imageMap];
            
            return (
              <div
                key={agent.id}
                className="crypto-card group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Agent Image */}
                <div className="relative mb-6 overflow-hidden rounded-lg">
                  <img 
                    src={agentImage} 
                    alt={agent.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    agent.status === 'Active' ? 'status-active' : 
                    agent.status === 'Processing' ? 'status-processing' : 'status-idle'
                  }`}>
                    {agent.status}
                  </div>

                  {/* Icon */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{agent.name}</h3>
                    <p className="text-muted-foreground text-sm">{agent.role}</p>
                  </div>

                  {/* Current Task */}
                  {agent.currentTask && (
                    <div className="bg-muted/20 rounded-lg p-3">
                      <div className="text-xs text-primary font-semibold mb-1">CURRENT TASK</div>
                      <div className="text-sm text-foreground">{agent.currentTask}</div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center pt-4 border-t border-card-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{agent.tasksCompleted}</div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent">{agent.status === 'Active' ? '24/7' : 'Idle'}</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">98%</div>
                      <div className="text-xs text-muted-foreground">Success</div>
                    </div>
                  </div>

                  {/* Activity Indicator */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last Activity:</span>
                    <span className="text-primary">{agent.lastActivity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Activity Feed */}
        <div className="mt-16 crypto-card max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Live Activity Feed</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
              <span className="text-sm text-primary font-semibold">LIVE</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { agent: 'Trend Analyst', action: 'Detected viral trend: #AI revolution', time: '2s ago', type: 'trend' },
              { agent: 'Concept Creator', action: 'Generated new concept: RobotCoin', time: '15s ago', type: 'concept' },
              { agent: 'Meme Designer', action: 'Created viral meme for ElonDogeMars', time: '1m ago', type: 'design' },
              { agent: 'Smart Contract Dev', action: 'Deployed CryptoFrog on Solana', time: '3m ago', type: 'deploy' },
              { agent: 'Growth Hacker', action: 'Boosted EDM social engagement +340%', time: '5m ago', type: 'marketing' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-muted/10 rounded-lg animate-fade-in">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'trend' ? 'bg-primary' :
                  activity.type === 'concept' ? 'bg-secondary' :
                  activity.type === 'design' ? 'bg-accent' :
                  activity.type === 'deploy' ? 'bg-warning' : 'bg-destructive'
                } animate-pulse-glow`} />
                
                <div className="flex-1">
                  <span className="text-sm font-semibold text-primary">{activity.agent}</span>
                  <span className="text-sm text-foreground ml-2">{activity.action}</span>
                </div>
                
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};