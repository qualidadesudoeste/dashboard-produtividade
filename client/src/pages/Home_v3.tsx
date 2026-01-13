/**
 * Design Philosophy: Modern Compact Dashboard
 * - Maximum information density without clutter
 * - Vibrant colors with gradients and depth
 * - Clear visual hierarchy with focal points
 * - Efficient space usage (~50% height reduction)
 * - Horizontal compact filters (single row)
 * - Prominent hero cards for top performers
 * - Grid 3x2 KPIs with visual impact
 * - Symmetric 2x2 charts grid
 * - Enhanced typography and micro-interactions
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
import { Clock, Activity, FolderKanban, Users, CheckCircle2, Target, Zap, Trophy, Crown, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

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
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
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

  // Filtros rápidos de período
  const aplicarFiltroRapido = (tipo: string) => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const dia = hoje.getDate();

    let inicio = "";
    let fim = "";

    switch (tipo) {
      case "ultimos7":
        const data7dias = new Date(hoje);
        data7dias.setDate(dia - 7);
        inicio = data7dias.toISOString().split("T")[0];
        fim = hoje.toISOString().split("T")[0];
        break;

      case "ultimos30":
        const data30dias = new Date(hoje);
        data30dias.setDate(dia - 30);
        inicio = data30dias.toISOString().split("T")[0];
        fim = hoje.toISOString().split("T")[0];
        break;

      case "trimestre":
        const trimestreInicio = Math.floor(mes / 3) * 3;
        const inicioTrimestre = new Date(ano, trimestreInicio, 1);
        inicio = inicioTrimestre.toISOString().split("T")[0];
        fim = hoje.toISOString().split("T")[0];
        break;

      case "ano":
        inicio = `${ano}-01-01`;
        fim = hoje.toISOString().split("T")[0];
        break;

      case "limpar":
        inicio = "";
        fim = "";
        break;
    }

    setDataInicio(inicio);
    setDataFim(fim);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-lg font-semibold text-gray-700">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Filtros
  const filteredData = data.filter((row) => {
    if (selectedColaborador !== "todos" && row.Colaborador !== selectedColaborador) return false;
    if (selectedProjeto !== "todos" && row.Projeto !== selectedProjeto) return false;
    if (dataInicio && row.Início < dataInicio) return false;
    if (dataFim && row.Fim > dataFim) return false;
    return true;
  });

  // KPIs
  const totalHoras = filteredData.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
  const totalAtividades = filteredData.length;
  const totalColaboradores = new Set(filteredData.map((r) => r.Colaborador)).size;
  const totalProjetos = new Set(filteredData.map((r) => r.Projeto)).size;
  const atividadesConcluidas = filteredData.filter((r) => r.Status === "Concluído").length;
  const taxaConclusao = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0;
  const totalPontosFuncao = filteredData.reduce((sum, r) => sum + (r.PF || 0), 0);

  // Distribuição por Tipo
  const tipoCount = filteredData.reduce((acc, r) => {
    acc[r.Tipo] = (acc[r.Tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tipoData = Object.entries(tipoCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const tipoMaisFrequente = tipoData[0];
  const percTipoMaisFrequente = tipoMaisFrequente
    ? ((tipoMaisFrequente.value / totalAtividades) * 100).toFixed(1)
    : "0";

  // Distribuição por Status
  const statusCount = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  const STATUS_COLORS: Record<string, string> = {
    "Concluído": "#10B981",
    "Teste": "#3B82F6",
    "Não Avaliado/Localizado": "#F59E0B",
    "Review": "#8B5CF6",
  };

  // Rankings
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const rankingProjetos = Object.entries(projetoHoras)
    .map(([projeto, horas]) => ({ projeto, horas }))
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 10);

  const colaboradorHoras = filteredData.reduce((acc, r) => {
    acc[r.Colaborador] = (acc[r.Colaborador] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const rankingColaboradores = Object.entries(colaboradorHoras)
    .map(([colaborador, horas]) => ({ colaborador, horas }))
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 10);

  const topProjeto = rankingProjetos[0];
  const topColaborador = rankingColaboradores[0];

  // Matriz
  const matrizData = filteredData.reduce((acc, r) => {
    const key = `${r.Colaborador}|||${r.Projeto}`;
    acc[key] = (acc[key] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const colaboradoresUnicos = Array.from(new Set(filteredData.map((r) => r.Colaborador))).sort();
  const projetosUnicos = Array.from(new Set(filteredData.map((r) => r.Projeto))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* Filtros Compactos - Single Row */}
        <Card className="shadow-lg border-2 border-blue-100">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {/* Colaborador */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Colaborador
                </label>
                <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "todos" ? "Todos" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Projeto */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <FolderKanban className="h-3 w-3" />
                  Projeto
                </label>
                <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p === "todos" ? "Todos" : p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Início */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">De</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Data Fim */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Até</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  min={dataInicio || undefined}
                  disabled={!dataInicio}
                  className="h-9 text-sm disabled:opacity-50"
                />
              </div>

              {/* Filtros Rápidos */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-600">Período</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => aplicarFiltroRapido("ultimos30")}
                    className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    30d
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido("trimestre")}
                    className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                  >
                    Trim
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido("ano")}
                    className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                  >
                    Ano
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido("limpar")}
                    className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Cards - Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Projeto */}
          <Card className="shadow-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white hover:shadow-2xl transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-pink-600 uppercase tracking-wide">Top Projeto</p>
                  <p className="text-lg font-extrabold text-gray-900 truncate">
                    {topProjeto ? topProjeto.projeto : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {topProjeto ? `${topProjeto.horas.toFixed(1)}h trabalhadas` : "0.0h trabalhadas"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Colaborador */}
          <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-2xl transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                  <Crown className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Top Colaborador</p>
                  <p className="text-lg font-extrabold text-gray-900 truncate">
                    {topColaborador ? topColaborador.colaborador : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {topColaborador ? `${topColaborador.horas.toFixed(1)}h trabalhadas` : "0.0h trabalhadas"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs Grid 3x2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Horas */}
          <Card className="shadow-lg border-l-4 border-l-blue-600 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Horas</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {totalHoras.toFixed(1)}<span className="text-lg text-gray-500">h</span>
                  </p>
                </div>
                <Clock className="h-10 w-10 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card className="shadow-lg border-l-4 border-l-green-600 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Atividades</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalAtividades}</p>
                </div>
                <Activity className="h-10 w-10 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Colaboradores */}
          <Card className="shadow-lg border-l-4 border-l-purple-600 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Colaboradores</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalColaboradores}</p>
                </div>
                <Users className="h-10 w-10 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Projetos */}
          <Card className="shadow-lg border-l-4 border-l-orange-600 bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Projetos</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalProjetos}</p>
                </div>
                <FolderKanban className="h-10 w-10 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Taxa Conclusão */}
          <Card className="shadow-lg border-l-4 border-l-teal-600 bg-gradient-to-br from-teal-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Taxa Conclusão</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {taxaConclusao.toFixed(1)}<span className="text-lg text-gray-500">%</span>
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-teal-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Pontos Função */}
          <Card className="shadow-lg border-l-4 border-l-amber-600 bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pontos Função</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {totalPontosFuncao}<span className="text-lg text-gray-500">PF</span>
                  </p>
                </div>
                <Target className="h-10 w-10 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Distribuição por Tipo */}
          <Card className="shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Distribuição por Tipo de Atividade
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                {tipoMaisFrequente?.name} representa {percTipoMaisFrequente}% das atividades
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tipoData} margin={{ top: 10, right: 10, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF",
                      border: "2px solid #3B82F6",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ranking Projetos */}
          <Card className="shadow-lg border-2 border-pink-100 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-pink-600" />
                  Ranking Projetos
                </span>
                <span className="text-xs font-normal text-gray-500">Top 10</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                {rankingProjetos.map((item, idx) => (
                  <div
                    key={item.projeto}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-pink-50 to-transparent hover:from-pink-100 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" :
                      idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                      idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                      "bg-gray-200 text-gray-700"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.projeto}</p>
                    </div>
                    <div className="text-sm font-bold text-pink-600">{item.horas.toFixed(1)}h</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card className="shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Distribuição por Status
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                {atividadesConcluidas} concluídas · {totalAtividades - atividadesConcluidas} em andamento
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#94A3B8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF",
                      border: "2px solid #10B981",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ranking Colaboradores */}
          <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Ranking Colaboradores
                </span>
                <span className="text-xs font-normal text-gray-500">Top 10</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                {rankingColaboradores.map((item, idx) => (
                  <div
                    key={item.colaborador}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" :
                      idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                      idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                      "bg-gray-200 text-gray-700"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.colaborador}</p>
                    </div>
                    <div className="text-sm font-bold text-purple-600">{item.horas.toFixed(1)}h</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matriz Colapsável */}
        <Card className="shadow-lg border-2 border-gray-200">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsMatrizExpanded(!isMatrizExpanded)}
          >
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Colaborador × Projeto (Completo)</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal text-gray-500">
                  {colaboradoresUnicos.length} colaboradores × {projetosUnicos.length} projetos
                </span>
                {isMatrizExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          {isMatrizExpanded && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold sticky left-0 bg-gray-100 z-10">
                        Colaborador
                      </th>
                      {projetosUnicos.map((p) => (
                        <th key={p} className="border border-gray-300 px-2 py-1 text-center font-semibold min-w-[80px]">
                          {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {colaboradoresUnicos.map((c) => (
                      <tr key={c} className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 px-2 py-1 font-semibold sticky left-0 bg-white">
                          {c}
                        </td>
                        {projetosUnicos.map((p) => {
                          const horas = matrizData[`${c}|||${p}`] || 0;
                          return (
                            <td
                              key={p}
                              className={`border border-gray-300 px-2 py-1 text-center ${
                                horas > 0 ? "bg-blue-100 font-semibold text-blue-900" : "text-gray-400"
                              }`}
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
    </div>
  );
}
