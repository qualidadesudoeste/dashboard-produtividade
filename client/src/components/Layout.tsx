import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, BarChart3, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/auditoria", label: "Auditoria", icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Navegação */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold">Dashboard Gerencial</h1>
                <p className="text-xs text-muted-foreground">Análise de Produtividade e Qualidade</p>
              </div>
              
              {/* Navegação */}
              <nav className="flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "gap-2",
                          isActive && "shadow-sm"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
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
  );
}
