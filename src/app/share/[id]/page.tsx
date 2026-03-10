"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRTDB } from '@/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Game } from '@/lib/games';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MonitorPlay, AlertCircle, Play, Globe } from 'lucide-react';
import Image from 'next/image';

export default function SharePage() {
  const { id } = useParams();
  const router = useRouter();
  const rtdb = useRTDB();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!rtdb || !id) return;
    const gameRef = ref(rtdb, `submissions/${id}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGame({
          id: id as string,
          title: data.gameName,
          description: data.developerInfo,
          url: data.gameUrl,
          thumbnail: data.thumbnailUrl,
          category: data.gameType,
          views: data.views || '0',
          played: data.played || '0',
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          createdAt: data.createdAt
        });
      } else {
        setGame(null);
      }
      setLoading(false);
    });

    return () => off(gameRef, 'value', unsubscribe);
  }, [rtdb, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
        <div className="flex gap-2 mb-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        <p className="text-3xl font-black uppercase tracking-[0.2em] text-primary animate-pulse italic">Resolving Uplink...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Can't Find the Application/Engine</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">The requested protocol is either missing or offline.</p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
          <ArrowLeft className="w-4 h-4" /> Return to Console
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
          <ArrowLeft className="w-4 h-4" /> Console Home
        </Button>
        <div className="flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest italic text-foreground">Share Item</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col items-center justify-center space-y-8">
        <div className="w-full bg-card border border-border p-8 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <Globe className="w-12 h-12 text-primary/10 -rotate-12" />
          </div>
          
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-black">
            <Image
              src={game.thumbnail || 'https://picsum.photos/seed/app/600/400'}
              alt={game.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{game.title}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{game.category} // Developed By: {game.description}</p>
            </div>
            
            <Button 
              onClick={() => setActiveGame(game)}
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] border border-white/20"
            >
              <Play className="w-6 h-6 mr-3 fill-current" />
              Play Now
            </Button>
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
          Shared via Connect Plus Console Url
        </p>
      </main>

      <GameLaunchPad game={activeGame} onClose={() => setActiveGame(null)} />
    </div>
  );
}