
"use client";

import { 
  Gamepad2, 
  LayoutGrid, 
  Heart, 
  Clock, 
  Settings, 
  User, 
  Trophy,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, active }: NavItemProps) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-sidebar-accent hover:text-accent"
    )}>
      <Icon className={cn("w-5 h-5", active ? "" : "group-hover:scale-110 transition-transform")} />
      <span className="font-medium text-sm">{label}</span>
      {active && <ChevronRight className="ml-auto w-4 h-4" />}
    </button>
  );
}

export function SidebarNav() {
  return (
    <aside className="w-72 h-screen flex flex-col bg-sidebar border-r border-border sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter font-headline text-foreground italic">GAMENEXUS</h1>
            <div className="h-1 w-full bg-accent/20 rounded-full mt-0.5 overflow-hidden">
              <div className="h-full w-2/3 bg-accent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search games..." 
            className="pl-10 bg-sidebar-accent border-none focus-visible:ring-accent/50 placeholder:text-muted-foreground/50 h-11"
          />
        </div>

        <nav className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold px-4 mb-2">Main Menu</div>
          <NavItem icon={LayoutGrid} label="Library" active />
          <NavItem icon={Trophy} label="Competitions" />
          <NavItem icon={Heart} label="Favorites" />
          <NavItem icon={Clock} label="Recent Plays" />
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">Guest Player</p>
              <p className="text-[10px] text-accent font-medium">Lvl 1 Rookie</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-accent" />
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 text-right">350 / 1000 XP</p>
        </div>

        <nav className="space-y-1">
          <NavItem icon={Settings} label="Console Settings" />
        </nav>
      </div>
    </aside>
  );
}
