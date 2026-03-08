
"use client";

import { useState } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay } from 'lucide-react';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Header - Connect Pulse Consoles */}
        <header className="flex flex-col gap-4 border-b border-border/30 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <MonitorPlay className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-foreground">
              Connect Pulse Consoles
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Status: Operational // PID: 9942
          </div>
        </header>

        {/* Line by Line Game List */}
        <section className="bg-card/10 rounded-2xl border border-border/30 overflow-hidden">
          <div className="hidden sm:flex items-center px-6 py-3 bg-muted/20 border-b border-border/30 text-[10px] uppercase font-black text-muted-foreground/40 tracking-widest">
            <span className="w-32 mr-6">Preview</span>
            <span className="flex-1">Identity & Metrics</span>
            <span>Link Status</span>
          </div>

          <div className="flex flex-col">
            {GAMES_LIBRARY.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={(game) => setActiveGame(game)} 
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-10 flex justify-between items-center text-muted-foreground/30">
          <p className="text-[10px] font-mono uppercase tracking-widest">NEXUS_OS_CORE v3.0</p>
          <div className="flex gap-4">
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="w-1 h-1 bg-primary rounded-full" />
          </div>
        </footer>
      </main>

      <GameLaunchPad 
        game={activeGame} 
        onClose={() => setActiveGame(null)} 
      />
    </div>
  );
}
