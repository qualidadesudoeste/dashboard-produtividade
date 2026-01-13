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
    { path: "/", label: "Dashboard", icon: BarChart3, description: "Visão geral de produtividade" },
    { path: "/auditoria", label: "Auditoria", icon: FileCheck, description: "Status de qualidade dos projetos" },
    { path: "/ciclos-teste", label: "Ciclos de Teste", icon: TestTube, description: "Gestão de testes e bugs" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card/95 backdrop-blur-md border-r border-primary/30 transition-all duration-300 z-20 shadow-[0_0_30px_rgba(59,130,246,0.2)]",
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
              <div className="mb-2">
                <h2 className="text-xl font-bold">Dashboard</h2>
              </div>
            )}
            {sidebarOpen && (
              <p className="text-xs text-muted-foreground overflow-hidden">Gestão de Produtividade</p>
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
                      isActive ? "bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-transparent hover:border-primary/30 hover:bg-accent/50"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {item.path !== "/" && (
                      <Icon className={cn(
                        "shrink-0 transition-transform group-hover:scale-110",
                        sidebarOpen ? "h-5 w-5" : "h-6 w-6"
                      )} />
                    )}
                    {sidebarOpen && (
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        <span className={cn(
                          "text-xs whitespace-nowrap",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
        {/* Header */}
        <header className="border-b border-primary/20 bg-card/50 backdrop-blur-md sticky top-0 z-10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent gradient-animated">
                    {navItems.find((item) => item.path === location)?.label || "Dashboard"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {navItems.find((item) => item.path === location)?.description || "Análise de Produtividade"}
                  </p>
                </div>
              </div>


            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="container py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-primary/20 bg-card/30 backdrop-blur-md py-6 mt-12 shadow-[0_-10px_30px_rgba(59,130,246,0.1)]">
          <div className="container">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>Dashboard Gerencial · Atualizado em tempo real</p>
              <p className="text-xs">© 2025 - Gestão de Produtividade</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
