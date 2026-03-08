"use client";

import { 
  Gamepad2, 
  Settings, 
  Search,
  Monitor
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
    </button>
  );
}

export function SidebarNav() {
  return (
    <aside className="w-72 h-screen flex flex-col bg-sidebar border-r border-border sticky top-0 shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter font-headline text-foreground italic uppercase">Nexus OS</h1>
            <div className="h-1 w-full bg-accent/20 rounded-full mt-0.5 overflow-hidden">
              <div className="h-full w-2/3 bg-accent" />
            </div>
          </div>
        </div>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search system..." 
            className="pl-10 bg-sidebar-accent border-none focus-visible:ring-accent/50 placeholder:text-muted-foreground/50 h-11"
          />
        </div>

        <nav className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold px-4 mb-2">System</div>
          <NavItem icon={Monitor} label="Active Console" active />
          <NavItem icon={Settings} label="Engine Settings" />
        </nav>
      </div>

      <div className="mt-auto p-8">
        <div className="bg-card/50 rounded-2xl p-4 border border-border">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
            Core_Status: ONLINE<br />
            Buffer: OPTIMIZED<br />
            Lat: 12ms
          </p>
        </div>
      </div>
    </aside>
  );
}
