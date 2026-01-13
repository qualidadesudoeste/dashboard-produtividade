import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, FileCheck, TestTube, ChevronLeft, ChevronRight, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3, description: "Visão geral de produtividade" },
    { path: "/auditoria", label: "Auditoria", icon: FileCheck, description: "Status de qualidade dos projetos" },
    { path: "/ciclos-teste", label: "Ciclos de Teste", icon: TestTube, description: "Gestão de testes e bugs" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar com degradê azul */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full sidebar-gradient transition-all duration-300 z-20 shadow-lg",
          sidebarOpen ? "w-60" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className={cn(
            "p-6 border-b border-white/10",
            !sidebarOpen && "px-4"
          )}>
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Dashboard</h2>
                  <p className="text-xs text-white/70">Gestão de Produtividade</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200",
                      !sidebarOpen && "justify-center px-2",
                      isActive && "bg-white/20 text-white font-medium shadow-sm"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
                    {sidebarOpen && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{item.label}</span>
                        {!isActive && (
                          <span className="text-xs text-white/60">{item.description}</span>
                        )}
                      </div>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full text-white/90 hover:bg-white/10 hover:text-white"
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span className="text-xs">Recolher</span>
                </>
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-60" : "ml-20"
        )}
      >
        {/* Header branco */}
        <header className="modern-header sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 bg-background/50 border-border/50 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
