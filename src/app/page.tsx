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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
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
      setUserData(snapshot.val());
      setDbLoading(false);
    }, (error) => {
      console.error(error);
      setDbLoading(false);
    });

    return () => unsubscribe();
  }, [rtdb, user]);

  const handleLogin = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Authentication module not initialized.",
      });
      return;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const handleRegisterProfile = async () => {
    if (!rtdb || !user || !usernameInput.trim()) return;
    
    setIsRegistering(true);
    try {
      const userRef = ref(rtdb, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        username: usernameInput.trim().toUpperCase(),
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Pulse ID Initialized",
        description: `Welcome to the Nexus, ${usernameInput}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "Could not initialize Pulse ID.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (authLoading || (user && dbLoading)) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary animate-pulse flex items-center justify-center">
            <Cpu className="text-white w-6 h-6 animate-spin duration-[3000ms]" />
          </div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] animate-pulse">Syncing_Modules...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm space-y-8 bg-card/20 p-10 rounded-[2.5rem] border border-border/30 shadow-2xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-1000" />
          
          <div className="relative space-y-6 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-accent p-[2px] mx-auto shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:scale-110">
              <div className="w-full h-full bg-[#0a0c10] rounded-[1.9rem] flex items-center justify-center">
                <MonitorPlay className="text-primary w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                Pulse Console
              </h1>
              <p className="text-muted-foreground/60 text-[10px] font-mono uppercase tracking-[0.4em]">
                Secure Operator Terminal
              </p>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-2xl font-black uppercase tracking-[0.15em] gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs"
            >
              <LogIn className="w-5 h-5" />
              Initialize Login
            </Button>
            
            <div className="pt-4">
              <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em] border-t border-border/10 pt-4">
                Nexus_OS // Secured_Link_v4.0.2
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showRegistration = user && !userData && !dbLoading;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-0">
        <header className="sticky top-0 z-30 bg-[#0a0c10]/95 backdrop-blur-xl border-b border-border/20 py-5 transition-all duration-300">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20 group cursor-pointer hover:rotate-6 transition-transform">
                  <MonitorPlay className="text-white w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                    Pulse Consoles
                  </h1>
                  <p className="text-[9px] font-mono text-primary/60 uppercase tracking-[0.2em] mt-1">
                    Operator_{userData?.username || 'SYSTEM'}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => toast({ title: "Access Locked", description: "Admin permissions required." })}
                className="bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-full px-5 h-10 font-black uppercase text-[10px] tracking-widest gap-2 border border-accent/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                New Project
              </Button>
            </div>

            <div className="flex items-center justify-between bg-card/20 p-3 rounded-2xl border border-border/10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 overflow-hidden border border-primary/20 hover:border-primary transition-all">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={user.photoURL || ''} alt={userData?.username || 'User'} />
                        <AvatarFallback className="bg-secondary/50 rounded-none"><User size={20} className="text-primary"/></AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-[#0a0c10] border-border/30 rounded-2xl p-2 mt-2" align="start">
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black uppercase italic tracking-tighter text-foreground">
                          {userData?.username || user.displayName}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground/60">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/10 mx-2" />
                    <DropdownMenuItem onClick={handleLogout} className="m-1 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold uppercase text-[10px] tracking-widest p-3">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Terminate Session</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
                      Status: Active
                    </p>
                  </div>
                  <p className="text-[10px] text-foreground font-black uppercase italic tracking-tighter">
                    Nexus Network Console
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pr-2">
                <div className="w-1 h-4 bg-primary/20 rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-primary/40 rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-1 h-4 bg-primary/60 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        </header>

        <section className="pb-20 space-y-8 pt-6">
          <div className="flex flex-col gap-8">
            {GAMES_LIBRARY.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={(game) => setActiveGame(game)} 
              />
            ))}
          </div>
        </section>

        <footer className="py-10 flex flex-col items-center gap-4 text-muted-foreground/20 border-t border-border/5">
          <div className="flex gap-8">
            <p className="text-[8px] font-mono uppercase tracking-[0.3em]">Core_v4.0.2</p>
            <p className="text-[8px] font-mono uppercase tracking-[0.3em]">Realtime_Sync</p>
          </div>
          <p className="text-[8px] font-mono uppercase tracking-widest">© Pulse_Consoles_Inc</p>
        </footer>
      </main>

      <Dialog open={showRegistration}>
        <DialogContent className="sm:max-w-md bg-[#0a0c10] border-border/30 text-foreground [&>button]:hidden rounded-[2.5rem] p-8 shadow-3xl">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto sm:mx-0">
              <Terminal className="text-primary w-8 h-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Initialize Pulse ID</DialogTitle>
              <DialogDescription className="text-muted-foreground/60 text-[11px] leading-relaxed">
                Unauthorized identity detected. Please register your console operator handle to access the Nexus library.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-3">
              <label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">
                Operator Handle
              </label>
              <Input
                id="username"
                placeholder="OPERATOR_X"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="h-14 bg-card/10 border-border/20 focus:border-primary/50 focus:ring-primary/20 uppercase font-mono rounded-2xl px-5 text-sm tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleRegisterProfile}
              disabled={!usernameInput.trim() || isRegistering}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {isRegistering ? (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                  Synchronizing...
                </div>
              ) : "Finalize Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GameLaunchPad 
        game={activeGame} 
        onClose={() => setActiveGame(null)} 
      />
    </div>
  );
}
