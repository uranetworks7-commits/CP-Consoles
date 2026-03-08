"use client";

import { useState } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { SidebarNav } from '@/components/Sidebar';
import { MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [filter, setFilter] = useState('All');

  const filteredGames = filter === 'All' 
    ? GAMES_LIBRARY 
    : GAMES_LIBRARY.filter(g => g.category === filter);

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      {/* Static Sidebar - No mobile drawer */}
      <SidebarNav />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">
          {/* CP Console Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <MonitorPlay className="w-5 h-5" />
                <span className="text-sm font-bold tracking-widest uppercase">Direct-Play Mainframe</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight font-headline">
                CP CONSOLE <span className="text-primary">01</span>
              </h1>
              <p className="text-muted-foreground font-medium max-w-md">
                Simplified direct access to optimized gaming instances.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-sidebar p-1.5 rounded-2xl border border-border">
              {['All', 'Action', 'Shooter', 'Racing', 'Puzzle'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider",
                    filter === cat 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          {/* Line by Line Game List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-6 pb-2 border-b border-border/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
              <div className="flex gap-12">
                <span className="w-48">Instance ID</span>
                <span>Specification</span>
              </div>
              <span>Link Protocol</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredGames.map((game, idx) => (
                <div 
                  key={game.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${idx * 0.05}s` }}
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
          <footer className="pt-12 pb-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-bold tracking-tight uppercase">System Status: Optimal</p>
            </div>
            
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
              NEXUS_CORE v2.5.1 // PID: 4012
            </p>
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
