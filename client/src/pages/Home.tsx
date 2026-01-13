/**
 * Design Philosophy: Executive Dashboard Layout
 * - Compact KPIs in horizontal row (6 main metrics)
 * - Prominent charts with better proportions (60/40 split)
 * - Side column for rankings
 * - Collapsible matrix section to reduce scrolling
 * - Clear visual hierarchy with data-driven insights
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Clock, Activity, FolderKanban, Users, CheckCircle2, Target, Zap, Search, Calendar, ChevronDown, ChevronUp } from "lucide-react";

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
  const [isMatrizExpanded, setIsMatrizExpanded] = useState(false);

  // useMemo deve vir ANTES do useEffect para manter ordem consistente dos hooks
  const colaboradores = useMemo(() => ["todos", ...Array.from(new Set(data.map((r) => r.Colaborador)))], [data]);
  const projetos = useMemo(() => ["todos", ...Array.from(new Set(data.map((r) => r.Projeto)))], [data]);

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
    if (dataFim && value > dataFim) {
      setDataFim("");
    }
  };

  const handleDataFimChange = (value: string) => {
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
    
    let matchDataInicio = true;
    let matchDataFim = true;
    
    if (dataInicio) {
      matchDataInicio = record.Início >= dataInicio;
    }
    if (dataFim) {
      matchDataFim = record.Fim <= dataFim;
    }
    
    return matchColaborador && matchProjeto && matchDataInicio && matchDataFim;
  });

  const totalHoras = filteredData.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
  const totalAtividades = filteredData.length;
  const atividadesConcluidas = filteredData.filter((r) => r.Status === "Concluído").length;
  const atividadesAndamento = filteredData.filter((r) => r.Status === "Em andamento").length;
  const totalColaboradores = new Set(filteredData.map((r) => r.Colaborador)).size;
  const totalProjetos = new Set(filteredData.map((r) => r.Projeto)).size;
  const mediaPorColaborador = totalColaboradores > 0 ? totalHoras / totalColaboradores : 0;
  const mediaPorProjeto = totalProjetos > 0 ? totalHoras / totalProjetos : 0;
  const mediaHoras = totalAtividades > 0 ? totalHoras / totalAtividades : 0;
  const taxaConclusao = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0;
  const totalPF = filteredData.reduce((sum, r) => sum + r.PF, 0);

  // Rankings
  const horasPorProjeto = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const horasPorColaborador = filteredData.reduce((acc, r) => {
    acc[r.Colaborador] = (acc[r.Colaborador] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const rankingProjetos = Object.entries(horasPorProjeto)
    .map(([nome, horas]) => ({ nome, horas }))
    .sort((a, b) => b.horas - a.horas);

  const rankingColaboradores = Object.entries(horasPorColaborador)
    .map(([nome, horas]) => ({ nome, horas }))
    .sort((a, b) => b.horas - a.horas);

  const rankingProjetosFiltrado = searchProjeto
    ? rankingProjetos.filter((p) => p.nome.toLowerCase().includes(searchProjeto.toLowerCase()))
    : rankingProjetos;

  const rankingColaboradoresFiltrado = searchColaborador
    ? rankingColaboradores.filter((c) => c.nome.toLowerCase().includes(searchColaborador.toLowerCase()))
    : rankingColaboradores;

  const topProjeto = rankingProjetos[0] || { nome: "N/A", horas: 0 };
  const topColaborador = rankingColaboradores[0] || { nome: "N/A", horas: 0 };

  // Distribuição por Tipo
  const atividadesPorTipo = filteredData.reduce((acc, r) => {
    acc[r.Tipo] = (acc[r.Tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosTipo = Object.entries(atividadesPorTipo)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // Distribuição por Status
  const atividadesPorStatus = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosStatus = Object.entries(atividadesPorStatus)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

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
    <div className="space-y-6 animate-in fade-in duration-500">
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

      {/* KPIs Compactos - Linha Horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total de Horas */}
        <Card className="cyber-card hover-lift border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <Clock className="h-5 w-5 text-blue-500 mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Total Horas</p>
              <p className="text-2xl font-bold">{totalHoras.toFixed(1)}<span className="text-sm text-muted-foreground">h</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Atividades */}
        <Card className="cyber-card hover-lift border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <Activity className="h-5 w-5 text-green-500 mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Atividades</p>
              <p className="text-2xl font-bold">{totalAtividades}</p>
            </div>
          </CardContent>
        </Card>

        {/* Colaboradores */}
        <Card className="cyber-card hover-lift border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <Users className="h-5 w-5 text-purple-500 mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Colaboradores</p>
              <p className="text-2xl font-bold">{totalColaboradores}</p>
            </div>
          </CardContent>
        </Card>

        {/* Projetos */}
        <Card className="cyber-card hover-lift border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <FolderKanban className="h-5 w-5 text-orange-500 mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Projetos</p>
              <p className="text-2xl font-bold">{totalProjetos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Taxa Conclusão */}
        <Card className="cyber-card hover-lift border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Taxa Conclusão</p>
              <p className="text-2xl font-bold">{taxaConclusao.toFixed(1)}<span className="text-sm text-muted-foreground">%</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Pontos de Função */}
        <Card className="cyber-card hover-lift border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <Target className="h-5 w-5 text-amber-500 mb-1" />
              <p className="text-xs font-medium text-muted-foreground">Pontos Função</p>
              <p className="text-2xl font-bold">{totalPF.toFixed(0)}<span className="text-sm text-muted-foreground">PF</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal: Gráficos (60%) + Rankings (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Coluna Esquerda: Gráficos de Distribuição (3 colunas = 60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Por Tipo de Atividade */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Tipo de Atividade</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {dadosTipo[0] && `${dadosTipo[0].nome} representa ${((dadosTipo[0].quantidade / totalAtividades) * 100).toFixed(1)}% das atividades`}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dadosTipo} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    stroke="#888"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="quantidade" fill={CHART_COLOR} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Por Status */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Status</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {atividadesConcluidas} concluídas · {atividadesAndamento} em andamento
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, quantidade }) => `${nome}: ${quantidade}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Rankings (2 colunas = 40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Top Projeto */}
            <Card className="cyber-card hover-lift border-l-4 border-l-rose-500">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Top Projeto</p>
                    <p className="text-sm font-bold truncate" title={topProjeto.nome}>{topProjeto.nome}</p>
                    <p className="text-xs text-muted-foreground">{topProjeto.horas.toFixed(1)}h trabalhadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Colaborador */}
            <Card className="cyber-card hover-lift border-l-4 border-l-indigo-500">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Top Colaborador</p>
                    <p className="text-sm font-bold truncate" title={topColaborador.nome}>{topColaborador.nome}</p>
                    <p className="text-xs text-muted-foreground">{topColaborador.horas.toFixed(1)}h trabalhadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking Projetos */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ranking Projetos</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {rankingProjetosFiltrado.length} de {rankingProjetos.length}
                </div>
              </div>
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar projeto..."
                    value={searchProjeto}
                    onChange={(e) => setSearchProjeto(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <ResponsiveContainer width="100%" height={Math.max(300, rankingProjetosFiltrado.length * 40)}>
                  <BarChart data={rankingProjetosFiltrado.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis type="number" stroke="#888" style={{ fontSize: '10px' }} />
                    <YAxis
                      dataKey="nome"
                      type="category"
                      width={120}
                      stroke="#888"
                      style={{ fontSize: '10px' }}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Colaboradores */}
          <Card className="cyber-card neon-border hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ranking Colaboradores</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {rankingColaboradoresFiltrado.length} de {rankingColaboradores.length}
                </div>
              </div>
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar colaborador..."
                    value={searchColaborador}
                    onChange={(e) => setSearchColaborador(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <ResponsiveContainer width="100%" height={Math.max(300, rankingColaboradoresFiltrado.length * 40)}>
                  <BarChart data={rankingColaboradoresFiltrado.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis type="number" stroke="#888" style={{ fontSize: '10px' }} />
                    <YAxis
                      dataKey="nome"
                      type="category"
                      width={120}
                      stroke="#888"
                      style={{ fontSize: '10px' }}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR_SECONDARY} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matriz de Alocação - Seção Colapsável */}
      <Card className="cyber-card neon-border hover-lift">
        <CardHeader>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsMatrizExpanded(!isMatrizExpanded)}
          >
            <div>
              <CardTitle className="text-lg">Colaborador × Projeto (Completo)</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Horas trabalhadas por colaborador em cada projeto · {colaboradoresFiltrados.length} colaboradores × {projetosFiltrados.length} projetos
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {isMatrizExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </CardHeader>
        
        {isMatrizExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar colaborador..."
                  value={matrizSearchColab}
                  onChange={(e) => setMatrizSearchColab(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projeto..."
                  value={matrizSearchProj}
                  onChange={(e) => setMatrizSearchProj(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="sticky left-0 z-20 bg-white text-left py-2 px-3 font-semibold text-muted-foreground min-w-[180px]">
                      Colaborador
                    </th>
                    {projetosFiltrados.map((proj) => (
                      <th
                        key={proj}
                        className="text-left py-2 px-3 font-semibold text-muted-foreground min-w-[100px] max-w-[150px]"
                        title={proj}
                      >
                        <div className="truncate">{proj}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colaboradoresFiltrados.map((colab) => (
                    <tr key={colab} className="border-b border-gray-200/50 hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white py-2 px-3 font-medium text-foreground">
                        {colab}
                      </td>
                      {projetosFiltrados.map((proj) => {
                        const horas = getHorasPorColabProj(colab, proj);
                        return (
                          <td
                            key={`${colab}-${proj}`}
                            className={`py-2 px-3 text-center ${getColorIntensity(horas)} transition-colors`}
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
          </CardContent>
        )}
      </Card>
    </div>
  );
}
