import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, BarChart3, FileCheck, TestTube, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
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
          "fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-20",
          sidebarOpen ? "w-64" : "w-0 -translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header do Sidebar */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Gestão de Produtividade</p>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-auto py-3",
                      isActive && "shadow-sm"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{item.label}</span>
                      <span className={cn(
                        "text-xs",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </span>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Footer do Sidebar */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Modo Escuro
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo Principal */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-10 w-10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">
                    {navItems.find((item) => item.path === location)?.label || "Dashboard"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {navItems.find((item) => item.path === location)?.description || "Análise de Produtividade"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="container py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-6 mt-12">
          <div className="container text-center text-sm text-muted-foreground">
            <p>Dashboard Gerencial · Atualizado em tempo real</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
