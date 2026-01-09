/* Design Philosophy: Swiss Precision + Data Visualization Excellence
 * - Clean, functional layout with strong grid system
 * - Data-driven color coding with meaningful gradients
 * - Micro-interactions and smooth animations
 * - Professional typography with clear hierarchy
 */

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, Activity, FolderKanban, Users, TrendingUp, CheckCircle2, Target, Zap, Search, Filter } from "lucide-react";

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

const CHART_COLOR = "#3B82F6";
const CHART_COLOR_SECONDARY = "#10B981";

export default function Home() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColaborador, setSelectedColaborador] = useState<string>("todos");
  const [selectedProjeto, setSelectedProjeto] = useState<string>("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("todos");
  const [matrizSearchColab, setMatrizSearchColab] = useState<string>("");
  const [matrizSearchProj, setMatrizSearchProj] = useState<string>("");

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

  const periodos = useMemo(() => {
    const meses = new Set(data.map((r) => r.Início.substring(0, 7)));
    return ["todos", ...Array.from(meses).sort()];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const filteredData = data.filter((record) => {
    const matchColaborador = selectedColaborador === "todos" || record.Colaborador === selectedColaborador;
    const matchProjeto = selectedProjeto === "todos" || record.Projeto === selectedProjeto;
    const matchPeriodo = selectedPeriodo === "todos" || record.Início.startsWith(selectedPeriodo);
    return matchColaborador && matchProjeto && matchPeriodo;
  });

  // Métricas Principais
  const totalHoras = filteredData.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
  const totalAtividades = filteredData.length;
  const totalColaboradores = new Set(filteredData.map((r) => r.Colaborador)).size;
  const totalProjetos = new Set(filteredData.map((r) => r.Projeto)).size;
  const mediaHoras = totalAtividades > 0 ? totalHoras / totalAtividades : 0;
  const taxaConclusao = totalAtividades > 0
    ? (filteredData.filter((r) => r.Status === "Concluído").length / totalAtividades) * 100
    : 0;

  // Métricas Adicionais Detalhadas
  const totalPF = filteredData.reduce((sum, r) => sum + (r.PF || 0), 0);
  const atividadesConcluidas = filteredData.filter((r) => r.Status === "Concluído").length;
  const atividadesEmAndamento = filteredData.filter((r) => r.Status !== "Concluído").length;
  const mediaHorasPorColaborador = totalColaboradores > 0 ? totalHoras / totalColaboradores : 0;
  const mediaHorasPorProjeto = totalProjetos > 0 ? totalHoras / totalProjetos : 0;
  const mediaPFPorAtividade = totalAtividades > 0 ? totalPF / totalAtividades : 0;

  // Distribuição por Tipo (detalhada)
  const tipoStats = filteredData.reduce((acc, r) => {
    if (!acc[r.Tipo]) {
      acc[r.Tipo] = { horas: 0, atividades: 0, pf: 0 };
    }
    acc[r.Tipo].horas += r.Horas_Trabalhadas;
    acc[r.Tipo].atividades += 1;
    acc[r.Tipo].pf += r.PF || 0;
    return acc;
  }, {} as Record<string, { horas: number; atividades: number; pf: number }>);

  const tipoMaisFrequente = Object.entries(tipoStats)
    .sort(([, a], [, b]) => b.atividades - a.atividades)[0];

  // Top Projeto e Colaborador
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const topProjeto = Object.entries(projetoHoras).sort(([, a], [, b]) => b - a)[0];

  const colaboradorHoras = filteredData.reduce((acc, r) => {
    acc[r.Colaborador] = (acc[r.Colaborador] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const topColaborador = Object.entries(colaboradorHoras).sort(([, a], [, b]) => b - a)[0];

  // Top 10 Projetos
  const top10Projetos = Object.entries(projetoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([nome, horas]) => ({ 
      nome: nome.length > 25 ? nome.substring(0, 25) + "..." : nome, 
      horas: Number(horas.toFixed(1)) 
    }));

  // Top 10 Colaboradores
  const top10Colaboradores = Object.entries(colaboradorHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([nome, horas]) => ({ 
      nome: nome.split(" ").slice(0, 2).join(" "),
      horas: Number(horas.toFixed(1)) 
    }));

  // Distribuição por Tipo
  const tipoHoras = filteredData.reduce((acc, r) => {
    acc[r.Tipo] = (acc[r.Tipo] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const distribuicaoTipo = Object.entries(tipoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([nome, horas]) => ({ 
      nome: nome.length > 20 ? nome.substring(0, 20) + "..." : nome,
      horas: Number(horas.toFixed(1)) 
    }));

  // Distribuição por Status
  const statusHoras = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const distribuicaoStatus = Object.entries(statusHoras)
    .sort(([, a], [, b]) => b - a)
    .map(([nome, horas]) => ({ nome, horas: Number(horas.toFixed(1)) }));

  // Matriz de Alocação (TODOS os dados com filtros)
  const todosColaboradores = Object.entries(colaboradorHoras)
    .sort(([, a], [, b]) => b - a)
    .map(([nome]) => nome);
  
  const todosProjetos = Object.entries(projetoHoras)
    .sort(([, a], [, b]) => b - a)
    .map(([nome]) => nome);

  // Filtrar colaboradores e projetos para a matriz
  const colaboradoresFiltrados = todosColaboradores.filter(colab =>
    colab.toLowerCase().includes(matrizSearchColab.toLowerCase())
  );

  const projetosFiltrados = todosProjetos.filter(proj =>
    proj.toLowerCase().includes(matrizSearchProj.toLowerCase())
  );

  const matrizAlocacao = colaboradoresFiltrados.map(colab => {
    const row: any = { colaborador: colab.split(" ").slice(0, 2).join(" ") };
    projetosFiltrados.forEach(proj => {
      const horas = filteredData
        .filter(r => r.Colaborador === colab && r.Projeto === proj)
        .reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
      row[proj] = horas;
    });
    return row;
  });

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "rgba(59, 130, 246, 0.05)";
    const max = Math.max(...matrizAlocacao.flatMap(row => 
      projetosFiltrados.map(proj => row[proj] || 0)
    ));
    const ratio = value / max;
    if (ratio > 0.75) return "rgba(59, 130, 246, 0.9)";
    if (ratio > 0.5) return "rgba(59, 130, 246, 0.6)";
    if (ratio > 0.25) return "rgba(59, 130, 246, 0.4)";
    return "rgba(59, 130, 246, 0.2)";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filtros Globais */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Colaborador
              </label>
              <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                <SelectTrigger className="h-11 hover:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {todosColaboradores.map((colab) => (
                    <SelectItem key={colab} value={colab}>
                      {colab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Projeto
              </label>
              <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                <SelectTrigger className="h-11 hover:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {todosProjetos.map((proj) => (
                    <SelectItem key={proj} value={proj}>
                      {proj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Período
              </label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="h-11 hover:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((periodo) => (
                    <SelectItem key={periodo} value={periodo}>
                      {periodo === "todos" ? "Todos os Períodos" : periodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais - Grid 3x3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total de Horas */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total de Horas</p>
                <p className="text-3xl font-bold">{totalHoras.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">h</span></p>
                <p className="text-xs text-muted-foreground">Tempo total trabalhado</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Clock className="h-7 w-7 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividades */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Atividades</p>
                <p className="text-3xl font-bold">{totalAtividades}</p>
                <p className="text-xs text-green-600 font-medium">{atividadesConcluidas} concluídas · {atividadesEmAndamento} em andamento</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Activity className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colaboradores */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                <p className="text-3xl font-bold">{totalColaboradores}</p>
                <p className="text-xs text-muted-foreground">Média: {mediaHorasPorColaborador.toFixed(1)}h por colaborador</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Users className="h-7 w-7 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projetos */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Projetos</p>
                <p className="text-3xl font-bold">{totalProjetos}</p>
                <p className="text-xs text-muted-foreground">Média: {mediaHorasPorProjeto.toFixed(1)}h por projeto</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <FolderKanban className="h-7 w-7 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Média h/Atividade */}
        <Card className="border-l-4 border-l-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Média h/Atividade</p>
                <p className="text-3xl font-bold">{mediaHoras.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">h</span></p>
                <p className="text-xs text-muted-foreground">Tempo médio por atividade</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <TrendingUp className="h-7 w-7 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa Conclusão */}
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold">{taxaConclusao.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">%</span></p>
                <p className="text-xs text-muted-foreground">{atividadesConcluidas} de {totalAtividades} atividades</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pontos de Função */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pontos de Função</p>
                <p className="text-3xl font-bold">{totalPF.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">PF</span></p>
                <p className="text-xs text-muted-foreground">Média: {mediaPFPorAtividade.toFixed(2)} PF/atividade</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Target className="h-7 w-7 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Projeto */}
        <Card className="border-l-4 border-l-rose-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Top Projeto</p>
                <p className="text-lg font-bold truncate" title={topProjeto?.[0]}>
                  {topProjeto?.[0] || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">{topProjeto?.[1]?.toFixed(1) || 0}h trabalhadas</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors shrink-0">
                <Zap className="h-7 w-7 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Colaborador */}
        <Card className="border-l-4 border-l-indigo-500 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Top Colaborador</p>
                <p className="text-lg font-bold truncate" title={topColaborador?.[0]}>
                  {topColaborador?.[0] || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">{topColaborador?.[1]?.toFixed(1) || 0}h trabalhadas</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0">
                <Zap className="h-7 w-7 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção: Rankings */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Rankings
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Projetos */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Projetos por Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top10Projetos} margin={{ left: 20, right: 20, top: 10, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
                    label={{ value: 'Horas (h)', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', opacity: 0.6 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}h`, 'Horas']}
                  />
                  <Bar dataKey="horas" fill={CHART_COLOR} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 10 Colaboradores */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Colaboradores por Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top10Colaboradores} margin={{ left: 20, right: 20, top: 10, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
                    label={{ value: 'Horas (h)', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', opacity: 0.6 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}h`, 'Horas']}
                  />
                  <Bar dataKey="horas" fill={CHART_COLOR_SECONDARY} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção: Distribuições */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Distribuições
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Tipo */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Por Tipo de Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={distribuicaoTipo} margin={{ left: 20, right: 20, top: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
                    label={{ value: 'Horas (h)', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', opacity: 0.6 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}h`, 'Horas']}
                  />
                  <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={distribuicaoStatus} margin={{ left: 20, right: 20, top: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }}
                    label={{ value: 'Horas (h)', angle: -90, position: 'insideLeft', style: { fill: 'currentColor', opacity: 0.6 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}h`, 'Horas']}
                  />
                  <Bar dataKey="horas" fill={CHART_COLOR_SECONDARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção: Matriz de Alocação */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Filter className="h-6 w-6 text-primary" />
          Matriz de Alocação
        </h2>
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Colaborador × Projeto (Completo)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Horas trabalhadas por colaborador em cada projeto · {colaboradoresFiltrados.length} colaboradores × {projetosFiltrados.length} projetos
            </p>
            {/* Filtros da Matriz */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar colaborador..."
                  value={matrizSearchColab}
                  onChange={(e) => setMatrizSearchColab(e.target.value)}
                  className="pl-10 h-11 hover:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projeto..."
                  value={matrizSearchProj}
                  onChange={(e) => setMatrizSearchProj(e.target.value)}
                  className="pl-10 h-11 hover:border-primary transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="overflow-auto max-h-[600px] relative">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b-2 bg-card">
                      <th className="text-left p-3 font-semibold sticky left-0 bg-card border-r-2 z-20 min-w-[180px]">
                        Colaborador
                      </th>
                      {projetosFiltrados.map((proj: string, idx: number) => (
                        <th key={idx} className="text-center p-3 font-semibold text-xs bg-card min-w-[100px]">
                          <div className="max-w-[100px] truncate" title={proj}>
                            {proj}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrizAlocacao.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium sticky left-0 bg-card border-r z-10">
                          {row.colaborador}
                        </td>
                        {projetosFiltrados.map((proj: string, pIdx: number) => {
                          const value = row[proj] || 0;
                          return (
                            <td 
                              key={pIdx} 
                              className="p-3 text-center font-mono text-sm font-semibold transition-all hover:scale-105"
                              style={{ 
                                backgroundColor: getHeatmapColor(value),
                                color: value > 0 ? '#fff' : 'inherit'
                              }}
                              title={value > 0 ? `${row.colaborador} · ${proj}: ${value.toFixed(1)}h` : ''}
                            >
                              {value > 0 ? `${value.toFixed(1)}h` : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
              <Search className="h-3 w-3" />
              Use os filtros acima para buscar colaboradores ou projetos específicos. Role horizontalmente para ver todos os dados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
