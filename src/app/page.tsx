
"use client";

import { useState, useMemo } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, User, PlusCircle, LogIn, LogOut, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useFirestore, useDoc } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  
  const { auth } = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const userDocRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userData, loading: dbLoading } = useDoc(userDocRef);

  const showRegistration = !!user && !userData && !dbLoading;

  const handleLogin = async () => {
    if (!auth) return;
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
    if (!db || !user || !usernameInput.trim()) return;
    
    setIsRegistering(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: usernameInput.trim(),
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
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

  return (
    <div className="min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-0 space-y-4">
        <header className="sticky top-0 z-30 bg-[#0a0c10]/95 backdrop-blur-md border-b border-border/30 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <MonitorPlay className="text-white w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                    Connect Pulse Consoles
                  </h1>
                  {userData?.username && (
                    <p className="text-[8px] font-mono text-accent uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                      <Terminal className="w-2.5 h-2.5" />
                      Active_Operator: {userData.username}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {authLoading ? (
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src={user.photoURL || ''} alt={userData?.username || 'User'} />
                          <AvatarFallback><User size={14}/></AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-card border-border/40" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground">{userData?.username || user.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/20" />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogin}
                    className="rounded-full bg-primary/10 border-primary/20 hover:bg-primary hover:text-white transition-all gap-2 h-8 px-3 font-bold uppercase text-[9px] tracking-widest"
                  >
                    <LogIn className="w-3 h-3" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => {
                  if (!user) handleLogin();
                  else toast({ title: "Access Locked", description: "Admin level required for new builds." });
                }}
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-4 h-8 font-black uppercase text-[9px] tracking-widest gap-2 shadow-lg shadow-accent/10"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Project
              </Button>
              <div className="flex-1 h-px bg-border/20" />
            </div>
          </div>
        </header>

        <section className="pb-8">
          <div className="flex flex-col gap-4">
            {GAMES_LIBRARY.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={(game) => setActiveGame(game)} 
              />
            ))}
          </div>
        </section>

        <footer className="py-6 flex justify-between items-center text-muted-foreground/30 border-t border-border/10">
          <p className="text-[9px] font-mono uppercase tracking-widest">NEXUS_OS_CORE v3.0</p>
          <div className="flex gap-3">
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="w-1 h-1 bg-primary rounded-full" />
          </div>
        </footer>
      </main>

      {/* Profile Setup Dialog */}
      <Dialog open={showRegistration}>
        <DialogContent className="sm:max-w-md bg-card border-border/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Initialize Pulse ID</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Welcome back to the Nexus. Please enter a unique handle to identify your console instance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Pulse ID Handle
              </label>
              <Input
                id="username"
                placeholder="OPERATOR_NAME"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-background border-border/50 focus:ring-primary uppercase font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleRegisterProfile}
              disabled={!usernameInput.trim() || isRegistering}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest"
            >
              {isRegistering ? "Synchronizing..." : "Finalize Profile"}
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
