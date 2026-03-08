"use client";

import { useState, useEffect } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, User, PlusCircle, LogIn, LogOut, Terminal, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useRTDB } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, set, onValue } from 'firebase/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  
  const auth = useAuth();
  const rtdb = useRTDB();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!rtdb || !user) {
      setDbLoading(false);
      setUserData(null);
      return;
    }

    const userRef = ref(rtdb, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
      setDbLoading(false);
    }, (error) => {
      console.error("RTDB Sync Error:", error);
      setDbLoading(false);
    });

    return () => unsubscribe();
  }, [rtdb, user]);

  const handleLogin = async () => {
    if (!auth || !rtdb) {
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: "Firebase services are still syncing. Please wait a moment.",
      });
      return;
    }

    if (!usernameInput.trim()) {
      toast({
        variant: "destructive",
        title: "Identification Required",
        description: "Enter an Operator Handle to begin initialization.",
      });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = ref(rtdb, `users/${result.user.uid}`);
      await set(userRef, {
        uid: result.user.uid,
        username: usernameInput.trim(),
        email: result.user.email,
        photoURL: result.user.photoURL,
        lastActive: new Date().toISOString(),
      });

      toast({
        title: "Pulse ID Verified",
        description: `Welcome, Operator ${usernameInput.trim()}.`,
      });
    } catch (error: any) {
      console.error("Auth Exception:", error);
      let errorMsg = error.message;
      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "Domain blocked. Add this URL to Firebase Auth -> Authorized Domains.";
      }
      
      toast({
        variant: "destructive",
        title: "System Failure",
        description: errorMsg,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUserData(null);
  };

  if (authLoading || (user && dbLoading)) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary animate-pulse flex items-center justify-center">
            <Cpu className="text-white w-6 h-6 animate-spin duration-[3000ms]" />
          </div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] animate-pulse">Synchronizing_Neural_Link...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 bg-card/20 p-10 rounded-[2.5rem] border border-border/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent p-[2px] mx-auto shadow-2xl shadow-primary/20">
                <div className="w-full h-full bg-[#0a0c10] rounded-[1.4rem] flex items-center justify-center">
                  <Terminal className="text-primary w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                  Pulse Console
                </h1>
                <p className="text-muted-foreground/60 text-[9px] font-mono uppercase tracking-[0.4em]">
                  System_Initialization_Req
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">
                  Operator Handle (Mixed Case Allowed)
                </label>
                <Input
                  placeholder="Ex: Commander_X"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="h-12 bg-card/10 border-border/20 focus:border-primary/50 focus:ring-primary/20 font-mono rounded-xl px-5 text-sm tracking-widest text-foreground"
                />
              </div>

              <Button 
                onClick={handleLogin}
                disabled={isLoggingIn || !usernameInput.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-black uppercase tracking-[0.15em] gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 text-[10px]"
              >
                {isLoggingIn ? (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    Linking...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Initialize Login
                  </>
                )}
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/10">
              <p className="text-[7px] font-mono text-center text-muted-foreground/30 uppercase tracking-[0.2em]">
                Secure_Handshake // Realtime_DB_Ready
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-0">
        <header className="sticky top-0 z-30 bg-[#0a0c10]/95 backdrop-blur-xl border-b border-border/20 py-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20">
                  <MonitorPlay className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                    Pulse Consoles
                  </h1>
                  <p className="text-[8px] font-mono text-primary/60 tracking-[0.2em] mt-1 uppercase">
                    Operator_{userData?.username || 'GUEST'}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline"
                className="bg-accent/5 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-4 h-9 font-black uppercase text-[9px] tracking-widest gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Project
              </Button>
            </div>

            <div className="flex items-center justify-between bg-card/10 p-2.5 rounded-xl border border-border/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 overflow-hidden border border-primary/20 hover:border-primary">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback className="bg-secondary/50 rounded-none"><User size={16} className="text-primary"/></AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#0a0c10] border-border/30 rounded-xl p-1 mt-2" align="start">
                    <DropdownMenuLabel className="p-3">
                      <p className="text-[10px] font-black italic tracking-tighter text-foreground">
                        {userData?.username || user.displayName}
                      </p>
                      <p className="text-[8px] font-mono text-muted-foreground/60">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/10" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold uppercase text-[9px] tracking-widest p-2.5">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Terminate Session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
                      Status: Active
                    </p>
                  </div>
                  <p className="text-[9px] text-foreground font-black uppercase italic tracking-tighter">
                    Pulse Network Console
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="pb-20 space-y-6 pt-6">
          <div className="grid gap-6">
            {GAMES_LIBRARY.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={(game) => setActiveGame(game)} 
              />
            ))}
          </div>
        </section>

        <footer className="py-8 flex flex-col items-center gap-3 text-muted-foreground/10 border-t border-border/5">
          <p className="text-[7px] font-mono uppercase tracking-[0.3em]">Core_v5.0.0 // RTDB_SYNC_ENABLED</p>
          <p className="text-[7px] font-mono uppercase tracking-widest">© Pulse_Consoles_Systems</p>
        </footer>
      </main>

      <GameLaunchPad 
        game={activeGame} 
        onClose={() => setActiveGame(null)} 
      />
    </div>
  );
}
