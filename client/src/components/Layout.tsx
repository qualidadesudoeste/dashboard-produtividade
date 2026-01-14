import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, FileCheck, TestTube, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3, description: "" },
    { path: "/auditoria", label: "Auditoria", icon: FileCheck, description: "" },
    { path: "/ciclos-teste", label: "Ciclos de Teste", icon: TestTube, description: "" },
  ];

  return (
    <div className="min-h-screen bg-background flex data-grid">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar backdrop-blur-xl border-r border-primary/30 transition-all duration-300 z-20 neon-glow",
          sidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header do Sidebar */}
          <div className={cn(
            "p-6 border-b transition-all duration-300",
            !sidebarOpen && "px-4"
          )}>
            {sidebarOpen && (
              <div className="mb-2 flex justify-center">
                <img src="/images/logo.png" alt="Produtividade" className="h-40 w-auto" />
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
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full h-auto transition-all duration-300 group relative overflow-hidden border",
                      sidebarOpen ? "justify-start gap-3 py-3 px-4" : "justify-center p-3",
                      isActive ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-transparent hover:border-primary/30 hover:bg-primary/10 hover:backdrop-blur-xl"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >

                    {sidebarOpen && (
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        <span className={cn(
                          "text-xs whitespace-nowrap",
                          isActive ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </span>
                      </div>
                    )}
                    {/* Indicador de página ativa */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Footer do Sidebar */}

        </div>

        {/* Botão de Toggle do Sidebar */}
        <Button
          variant="default"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "absolute -right-3 top-8 h-6 w-6 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "border-2 border-background"
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Conteúdo Principal */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-72" : "ml-20"
        )}
      >


        {/* Conteúdo */}
        <main className="container py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-primary/30 bg-sidebar/50 backdrop-blur-xl py-6 mt-12 neon-border">
          <div className="container">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>Dashboard Gerencial</p>
              <p className="text-xs">© Gestão de Produtividade</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
