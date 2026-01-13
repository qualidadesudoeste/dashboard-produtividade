/**
 * Design Philosophy: Swiss Precision meets Modern Data Visualization
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
import { Clock, Activity, FolderKanban, Users, TrendingUp, CheckCircle2, Target, Zap, Search, Filter, Calendar } from "lucide-react";

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
  const [searchColaborador, setSearchColaborador] = useState<string>("");
  const [searchProjeto, setSearchProjeto] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
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

  // Validação de datas
  const handleDataInicioChange = (value: string) => {
    setDataInicio(value);
    // Se data fim estiver preenchida e for menor que a nova data início, limpa data fim
    if (dataFim && value > dataFim) {
      setDataFim("");
    }
  };

  const handleDataFimChange = (value: string) => {
    // Só permite definir data fim se for maior ou igual à data início
    if (!dataInicio || value >= dataInicio) {
      setDataFim(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background data-grid">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent neon-glow"></div>
          <p className="text-muted-foreground text-lg gradient-text">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const filteredData = data.filter((record) => {
    const matchColaborador = selectedColaborador === "todos" || record.Colaborador === selectedColaborador;
    const matchProjeto = selectedProjeto === "todos" || record.Projeto === selectedProjeto;
    
    // Filtro de período com data início e fim
    let matchPeriodo = true;
    if (dataInicio && dataFim) {
      const recordDate = record.Início.substring(0, 10); // YYYY-MM-DD
      matchPeriodo = recordDate >= dataInicio && recordDate <= dataFim;
    } else if (dataInicio) {
      const recordDate = record.Início.substring(0, 10);
      matchPeriodo = recordDate >= dataInicio;
    } else if (dataFim) {
      const recordDate = record.Início.substring(0, 10);
      matchPeriodo = recordDate <= dataFim;
    }
    
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
  const atividadesConcluidas = filteredData.filter((r) => r.Status === "Concluído").length;
  const atividadesAndamento = filteredData.filter((r) => r.Status === "Em andamento").length;
  const totalPF = filteredData.reduce((sum, r) => sum + (r.PF || 0), 0);
  const mediaPorColaborador = totalColaboradores > 0 ? totalHoras / totalColaboradores : 0;
  const mediaPorProjeto = totalProjetos > 0 ? totalHoras / totalProjetos : 0;

  // Top Projeto e Colaborador
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const colaboradorHoras = filteredData.reduce((acc, r) => {
    acc[r.Colaborador] = (acc[r.Colaborador] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const topProjeto = Object.entries(projetoHoras).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
  const topColaborador = Object.entries(colaboradorHoras).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

  // Dados para gráficos
  // Ranking completo de projetos (todos)
  const rankingProjetos = Object.entries(projetoHoras)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, horas], index) => ({ 
      ranking: index + 1,
      nome, 
      horas: Number(horas.toFixed(1)) 
    }));

  // Filtrar projetos por busca
  const rankingProjetosFiltrado = rankingProjetos.filter(p => 
    p.nome.toLowerCase().includes(searchProjeto.toLowerCase())
  );

  // Ranking completo de colaboradores (todos)
  const rankingColaboradores = Object.entries(colaboradorHoras)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, horas], index) => ({ 
      ranking: index + 1,
      nome, 
      horas: Number(horas.toFixed(1)) 
    }));

  // Filtrar colaboradores por busca
  const rankingColaboradoresFiltrado = rankingColaboradores.filter(c => 
    c.nome.toLowerCase().includes(searchColaborador.toLowerCase())
  );

  const tipoDistribuicao = filteredData.reduce((acc, r) => {
    acc[r.Tipo] = (acc[r.Tipo] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const top10Tipos = Object.entries(tipoDistribuicao)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nome, horas]) => ({ nome, horas: Number(horas.toFixed(1)) }));

  const statusDistribuicao = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusDistribuicao).map(([nome, horas]) => ({
    nome,
    horas: Number(horas.toFixed(1)),
  }));

  // Listas únicas para filtros
  const colaboradores = ["todos", ...Array.from(new Set(data.map((r) => r.Colaborador))).sort()];
  const projetos = ["todos", ...Array.from(new Set(data.map((r) => r.Projeto))).sort()];

  // Matriz de Alocação
  const colaboradoresFiltrados = matrizSearchColab
    ? colaboradores.filter((c) => c !== "todos" && c.toLowerCase().includes(matrizSearchColab.toLowerCase()))
    : colaboradores.filter((c) => c !== "todos");

  const projetosFiltrados = matrizSearchProj
    ? projetos.filter((p) => p !== "todos" && p.toLowerCase().includes(matrizSearchProj.toLowerCase()))
    : projetos.filter((p) => p !== "todos");

  const getHorasPorColabProj = (colab: string, proj: string) => {
    return filteredData
      .filter((r) => r.Colaborador === colab && r.Projeto === proj)
      .reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
  };

  const maxHoras = Math.max(
    ...colaboradoresFiltrados.flatMap((c) =>
      projetosFiltrados.map((p) => getHorasPorColabProj(c, p))
    ),
    1
  );

  const getColorIntensity = (horas: number) => {
    if (horas === 0) return "bg-card";
    const intensity = Math.min(horas / maxHoras, 1);
    if (intensity > 0.7) return "bg-blue-600";
    if (intensity > 0.4) return "bg-blue-500";
    if (intensity > 0.2) return "bg-blue-400";
    return "bg-blue-300";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filtros Globais */}
      <Card className="cyber-card neon-border hover-lift">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Colaborador
              </label>
              <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                <SelectTrigger className="hover-border-glow">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c} value={c} className="hover-scale">
                      {c === "todos" ? "Todos" : c}
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
                <SelectTrigger className="hover-border-glow">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p} value={p} className="hover-scale">
                      {p === "todos" ? "Todos" : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                De
              </label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => handleDataInicioChange(e.target.value)}
                className="hover-border-glow"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Até
              </label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => handleDataFimChange(e.target.value)}
                min={dataInicio || undefined}
                disabled={!dataInicio}
                className="hover-border-glow disabled:opacity-50"
                title={!dataInicio ? "Selecione a data inicial primeiro" : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais - Grid 3x3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total de Horas */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-blue-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total de Horas</p>
                <p className="text-3xl font-bold">{totalHoras.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">h</span></p>
                <p className="text-xs text-muted-foreground">Tempo total trabalhado</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividades */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-green-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Atividades</p>
                <p className="text-3xl font-bold">{totalAtividades}</p>
                <p className="text-xs text-green-500">{atividadesConcluidas} concluídas · {atividadesAndamento} em andamento</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colaboradores */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-purple-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                <p className="text-3xl font-bold">{totalColaboradores}</p>
                <p className="text-xs text-muted-foreground">Média: {mediaPorColaborador.toFixed(1)}h por colaborador</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projetos */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-orange-500">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Projetos</p>
                <p className="text-3xl font-bold">{totalProjetos}</p>
                <p className="text-xs text-muted-foreground">Média: {mediaPorProjeto.toFixed(1)}h por projeto</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderKanban className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Média h/Atividade */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-cyan-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Média h/Atividade</p>
                <p className="text-3xl font-bold">{mediaHoras.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">h</span></p>
                <p className="text-xs text-muted-foreground">Tempo médio por atividade</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa Conclusão */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold">{taxaConclusao.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">%</span></p>
                <p className="text-xs text-muted-foreground">{atividadesConcluidas} de {totalAtividades} atividades</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pontos de Função */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pontos de Função</p>
                <p className="text-3xl font-bold">{totalPF.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">PF</span></p>
                <p className="text-xs text-muted-foreground">{totalAtividades > 0 ? (totalPF / totalAtividades).toFixed(2) : 0} PF por atividade</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Projeto */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-rose-500">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Top Projeto</p>
                <p className="text-xl font-bold truncate" title={topProjeto[0]}>{topProjeto[0]}</p>
                <p className="text-xs text-muted-foreground">{topProjeto[1].toFixed(1)}h trabalhadas</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Colaborador */}
        <Card className="cyber-card neon-glow hover-lift cursor-pointer group relative overflow-hidden border-l-4 border-l-indigo-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Top Colaborador</p>
                <p className="text-xl font-bold truncate" title={topColaborador[0]}>{topColaborador[0]}</p>
                <p className="text-xs text-muted-foreground">{topColaborador[1].toFixed(1)}h trabalhadas</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Rankings
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking Projetos */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ranking Projetos</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {rankingProjetosFiltrado.length} de {rankingProjetos.length}
                </div>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar projeto..."
                    value={searchProjeto}
                    onChange={(e) => setSearchProjeto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <ResponsiveContainer width="100%" height={Math.max(400, rankingProjetosFiltrado.length * 40)}>
                  <BarChart data={rankingProjetosFiltrado} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis
                      dataKey="nome"
                      type="category"
                      width={150}
                      stroke="#888"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.98)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "8px",
                        color: "#0f172a"
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}h`,
                        name === 'horas' ? 'Horas Trabalhadas' : name
                      ]}
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Colaboradores */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ranking Colaboradores</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {rankingColaboradoresFiltrado.length} de {rankingColaboradores.length}
                </div>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar colaborador..."
                    value={searchColaborador}
                    onChange={(e) => setSearchColaborador(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <ResponsiveContainer width="100%" height={Math.max(400, rankingColaboradoresFiltrado.length * 40)}>
                  <BarChart data={rankingColaboradoresFiltrado} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis
                      dataKey="nome"
                      type="category"
                      width={150}
                      stroke="#888"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.98)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "8px",
                        color: "#0f172a"
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}h`,
                        name === 'horas' ? 'Horas Trabalhadas' : name
                      ]}
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR_SECONDARY} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribuições */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Distribuições
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Tipo */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Por Tipo de Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10Tipos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="nome" stroke="#888" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="nome" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="horas" fill={CHART_COLOR_SECONDARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matriz de Alocação */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Filter className="h-6 w-6 text-primary" />
          Matriz de Alocação
        </h2>
        <Card className="cyber-card neon-border hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Colaborador × Projeto (Completo)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Horas trabalhadas por colaborador em cada projeto · {colaboradoresFiltrados.length} colaboradores × {projetosFiltrados.length} projetos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar colaborador..."
                  value={matrizSearchColab}
                  onChange={(e) => setMatrizSearchColab(e.target.value)}
                  className="pl-10 hover-border-glow"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projeto..."
                  value={matrizSearchProj}
                  onChange={(e) => setMatrizSearchProj(e.target.value)}
                  className="pl-10 hover-border-glow"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px] border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card z-10 border-b">
                  <tr>
                    <th className="sticky left-0 bg-card z-20 p-3 text-left font-semibold border-r min-w-[200px]">
                      Colaborador
                    </th>
                    {projetosFiltrados.map((proj) => (
                      <th
                        key={proj}
                        className="p-3 text-center font-semibold min-w-[120px] border-r last:border-r-0"
                        title={proj}
                      >
                        <div className="truncate max-w-[120px]">{proj}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresFiltrados.map((colab) => (
                    <tr key={colab} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                      <td className="sticky left-0 bg-card z-10 p-3 font-medium border-r">
                        <div className="truncate max-w-[200px]" title={colab}>
                          {colab}
                        </div>
                      </td>
                      {projetosFiltrados.map((proj) => {
                        const horas = getHorasPorColabProj(colab, proj);
                        return (
                          <td
                            key={`${colab}-${proj}`}
                            className={`p-3 text-center border-r last:border-r-0 transition-all hover:scale-105 cursor-pointer ${getColorIntensity(
                              horas
                            )}`}
                            title={`${colab} - ${proj}: ${horas.toFixed(1)}h`}
                          >
                            {horas > 0 ? horas.toFixed(1) : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              💡 Cores mais intensas indicam maior alocação de horas · Passe o mouse sobre as células para detalhes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
