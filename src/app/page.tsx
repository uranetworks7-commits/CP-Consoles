
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-0 space-y-6">
        {/* Header - Fixed/Sticky */}
        <header className="sticky top-0 z-30 bg-[#0a0c10]/95 backdrop-blur-md flex flex-col gap-4 border-b border-border/30 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <MonitorPlay className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-foreground">
              Connect Pulse Consoles
            </h1>
          </div>
        </header>

        {/* Line by Line Game List */}
        <section className="bg-card/10 rounded-2xl border border-border/30 overflow-hidden shadow-2xl pb-10">
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
        <footer className="py-10 flex justify-between items-center text-muted-foreground/30">
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
