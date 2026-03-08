
"use client";

import { useState } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { SidebarNav } from '@/components/Sidebar';
import { Gamepad2, Sparkles, Zap, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <SidebarNav />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl bg-sidebar border border-border p-12">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Gamepad2 className="w-64 h-64 text-primary" />
            </div>
            
            <div className="relative z-10 max-w-2xl space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New Games Added
                </Badge>
                <Badge variant="outline" className="border-primary/50 text-primary px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Connect Pulse Enabled
                </Badge>
              </div>
              
              <h1 className="text-5xl font-black tracking-tight leading-tight font-headline">
                LEVEL UP YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-cyan-400">
                  DIGITAL REALITY
                </span>
              </h1>
              
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                Welcome to GameNexus. Access a curated library of premium web-based experiences directly from your console. No downloads, just play.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveGame(GAMES_LIBRARY[0])}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 fill-current" />
                  Play Featured Now
                </button>
              </div>
            </div>
          </section>

          {/* Library Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold font-headline">The Vault</h2>
                <Badge variant="secondary" className="bg-sidebar px-3">
                  {GAMES_LIBRARY.length} Titles
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {['All', 'Action', 'Racing', 'Shooter', 'Puzzle'].map((cat) => (
                  <button 
                    key={cat}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      cat === 'All' 
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/20" 
                        : "text-muted-foreground hover:bg-sidebar"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {GAMES_LIBRARY.map((game, idx) => (
                <div 
                  key={game.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <GameCard 
                    game={game} 
                    onLaunch={(game) => setActiveGame(game)} 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Console Footer Info */}
          <footer className="pt-20 pb-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm font-medium">System Status: Online & Optimized</p>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="hover:text-accent transition-colors font-medium">Support</a>
              <a href="#" className="hover:text-accent transition-colors font-medium">Privacy Policy</a>
              <a href="#" className="hover:text-accent transition-colors font-medium">Changelog</a>
            </div>

            <p className="text-xs font-mono">GameNexus OS v2.4.0</p>
          </footer>
        </div>
      </main>

      <GameLaunchPad 
        game={activeGame} 
        onClose={() => setActiveGame(null)} 
      />
    </div>
  );
}

// Utility import for conditional classes if not already globally available
import { cn } from '@/lib/utils';
