/* Swiss Precision Dashboard - Dark mode com toggle e filtro de período */

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Clock, Users, FolderKanban, Activity, TrendingUp, CheckCircle2, Filter, Moon, Sun, Calendar } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface DataRecord {
  Colaborador: string;
  Projeto: string;
  Atividade: string;
  Tipo: string;
  Status: string;
  Início: string;
  Fim: string;
  "Hrs Trab.": string;
  Horas_Trabalhadas: number;
  PF: number;
}

const COLORS = ["#0A84FF", "#5AC8FA", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#FF2D55", "#FFD60A"];

export default function Home() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColaborador, setSelectedColaborador] = useState<string>("todos");
  const [selectedProjeto, setSelectedProjeto] = useState<string>("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("todos");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      });
  }, []);

  // Extrair períodos únicos dos dados
  const periodos = useMemo(() => {
    const meses = new Set(data.map((r) => r.Início.substring(0, 7)));
    return ["todos", ...Array.from(meses).sort()];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground text-lg">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  // Filtrar dados
  const filteredData = data.filter((record) => {
    const matchColaborador = selectedColaborador === "todos" || record.Colaborador === selectedColaborador;
    const matchProjeto = selectedProjeto === "todos" || record.Projeto === selectedProjeto;
    const matchPeriodo = selectedPeriodo === "todos" || record.Início.startsWith(selectedPeriodo);
    return matchColaborador && matchProjeto && matchPeriodo;
  });

  // Calcular KPIs
  const totalHoras = filteredData.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
  const totalAtividades = filteredData.length;
  const totalColaboradores = new Set(filteredData.map((r) => r.Colaborador)).size;
  const totalProjetos = new Set(filteredData.map((r) => r.Projeto)).size;
  const mediaHorasPorAtividade = totalAtividades > 0 ? totalHoras / totalAtividades : 0;
  const taxaConclusao =
    totalAtividades > 0
      ? (filteredData.filter((r) => r.Status === "Concluído").length / totalAtividades) * 100
      : 0;

  // Top 15 Colaboradores
  const colaboradorHoras = filteredData.reduce((acc, r) => {
    acc[r.Colaborador] = (acc[r.Colaborador] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const top15Colaboradores = Object.entries(colaboradorHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([nome, horas]) => ({ nome: nome.trim(), horas: Number(horas.toFixed(2)) }));

  // Top 10 Projetos
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const top10Projetos = Object.entries(projetoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([nome, horas]) => ({ 
      nome: nome.length > 35 ? nome.substring(0, 35) + "..." : nome, 
      horas: Number(horas.toFixed(2)) 
    }));

  // Distribuição por Tipo
  const tipoHoras = filteredData.reduce((acc, r) => {
    acc[r.Tipo] = (acc[r.Tipo] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const distribuicaoTipo = Object.entries(tipoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([nome, horas]) => ({ nome, horas: Number(horas.toFixed(2)) }));

  // Distribuição por Status
  const statusHoras = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const distribuicaoStatus = Object.entries(statusHoras)
    .sort(([, a], [, b]) => b - a)
    .map(([nome, horas]) => ({ nome, horas: Number(horas.toFixed(2)) }));

  // Evolução Temporal
  const mesHoras = filteredData.reduce((acc, r) => {
    const mes = r.Início.substring(0, 7);
    acc[mes] = (acc[mes] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const evolucaoTemporal = Object.entries(mesHoras)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, horas]) => ({ mes, horas: Number(horas.toFixed(2)) }));

  // Listas para filtros
  const colaboradores = ["todos", ...Array.from(new Set(data.map((r) => r.Colaborador))).sort()];
  const projetos = ["todos", ...Array.from(new Set(data.map((r) => r.Projeto))).sort()];

  // Formatar nome do período
  const formatarPeriodo = (periodo: string) => {
    if (periodo === "todos") return "Todos os Períodos";
    const [ano, mes] = periodo.split("-");
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com gradiente sutil e toggle de tema */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container py-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-6xl font-bold tracking-tight mb-3">
                Dashboard Gerencial
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                Análise de Produtividade · Colaboradores & Projetos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Período</p>
                <p className="text-xl font-bold font-mono">{formatarPeriodo(selectedPeriodo)}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-12 w-12 rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros com design refinado */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filtros de Análise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Colaborador
              </label>
              <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "todos" ? "📊 Todos os Colaboradores" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Projeto
              </label>
              <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p === "todos" ? "📁 Todos os Projetos" : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((p) => (
                    <SelectItem key={p} value={p}>
                      {formatarPeriodo(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs com design elevado */}
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total de Horas
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono tracking-tight">{totalHoras.toFixed(2)}h</div>
              <p className="text-xs text-muted-foreground mt-2">Horas trabalhadas no período</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Atividades
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-chart-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono tracking-tight">{totalAtividades.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Atividades registradas</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Colaboradores
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono tracking-tight">{totalColaboradores}</div>
              <p className="text-xs text-muted-foreground mt-2">Pessoas na equipe</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Projetos
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-chart-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono tracking-tight">{totalProjetos}</div>
              <p className="text-xs text-muted-foreground mt-2">Projetos ativos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-5 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Média h/Atividade
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-chart-5/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono tracking-tight">{mediaHorasPorAtividade.toFixed(2)}h</div>
              <p className="text-xs text-muted-foreground mt-2">Tempo médio por atividade</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Taxa de Conclusão
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono tracking-tight">{taxaConclusao.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">Atividades concluídas</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos com tabs elegantes */}
      <div className="container pb-16">
        <Tabs defaultValue="colaboradores" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 h-14 bg-card shadow-sm">
            <TabsTrigger value="colaboradores" className="text-base">
              👥 Colaboradores
            </TabsTrigger>
            <TabsTrigger value="projetos" className="text-base">
              📁 Projetos
            </TabsTrigger>
            <TabsTrigger value="tipos" className="text-base">
              🏷️ Tipos
            </TabsTrigger>
            <TabsTrigger value="temporal" className="text-base">
              📈 Temporal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colaboradores" className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-2xl">Top 15 Colaboradores</CardTitle>
                <CardDescription>Ranking por horas trabalhadas no período</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ResponsiveContainer width="100%" height={550}>
                  <BarChart data={top15Colaboradores} layout="vertical" margin={{ left: 220, right: 40, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="currentColor" className="opacity-60" style={{ fontSize: 13 }} />
                    <YAxis 
                      dataKey="nome" 
                      type="category" 
                      width={210} 
                      stroke="currentColor"
                      className="opacity-60"
                      style={{ fontSize: 12, fontWeight: 500 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Bar dataKey="horas" fill="#0A84FF" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projetos" className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-2xl">Top 10 Projetos</CardTitle>
                <CardDescription>Alocação de horas por projeto</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={top10Projetos} margin={{ bottom: 140, top: 20, left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" vertical={false} />
                    <XAxis 
                      dataKey="nome" 
                      angle={-45} 
                      textAnchor="end" 
                      height={140} 
                      stroke="currentColor"
                      className="opacity-60"
                      style={{ fontSize: 11, fontWeight: 500 }} 
                    />
                    <YAxis stroke="currentColor" className="opacity-60" style={{ fontSize: 13 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Bar dataKey="horas" fill="#0A84FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tipos" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Distribuição por Tipo</CardTitle>
                  <CardDescription>Horas por tipo de atividade</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <ResponsiveContainer width="100%" height={420}>
                    <PieChart>
                      <Pie
                        data={distribuicaoTipo}
                        dataKey="horas"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        label={(entry) => `${entry.nome.substring(0, 22)}`}
                        labelLine={{ stroke: 'currentColor', strokeWidth: 1, className: 'opacity-40' }}
                      >
                        {distribuicaoTipo.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          color: 'hsl(var(--card-foreground))'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Distribuição por Status</CardTitle>
                  <CardDescription>Horas por status das atividades</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <ResponsiveContainer width="100%" height={420}>
                    <PieChart>
                      <Pie
                        data={distribuicaoStatus}
                        dataKey="horas"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        label={(entry) => `${entry.nome}: ${entry.horas.toFixed(0)}h`}
                        labelLine={{ stroke: 'currentColor', strokeWidth: 1, className: 'opacity-40' }}
                      >
                        {distribuicaoStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          color: 'hsl(var(--card-foreground))'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-2xl">Evolução Temporal</CardTitle>
                <CardDescription>Tendência de horas trabalhadas ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart data={evolucaoTemporal} margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                    <XAxis 
                      dataKey="mes" 
                      stroke="currentColor"
                      className="opacity-60"
                      style={{ fontSize: 13, fontWeight: 500 }} 
                    />
                    <YAxis 
                      stroke="currentColor"
                      className="opacity-60"
                      style={{ fontSize: 13 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }} 
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="horas" 
                      stroke="#0A84FF" 
                      strokeWidth={4} 
                      dot={{ r: 7, fill: '#0A84FF', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                      activeDot={{ r: 9 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Dashboard Gerencial de Produtividade · Atualizado em tempo real</p>
        </div>
      </footer>
    </div>
  );
}
