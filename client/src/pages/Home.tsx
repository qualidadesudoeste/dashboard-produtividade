/**
 * Design Philosophy: Modern Blue Monochromatic Dashboard
 * - Single color theme: Blue only (various shades)
 * - Searchable lists instead of static charts
 * - Smooth animations and micro-interactions
 * - Maximum information density with filters
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
import { Clock, Activity, FolderKanban, Users, CheckCircle2, Target, Trophy, Crown, TrendingUp, Search, ChevronDown, ChevronUp } from "lucide-react";

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

export default function Home() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColaborador, setSelectedColaborador] = useState<string>("todos");
  const [selectedProjeto, setSelectedProjeto] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [isMatrizExpanded, setIsMatrizExpanded] = useState(false);
  const [searchTipo, setSearchTipo] = useState<string>("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchProjetos, setSearchProjetos] = useState<string>("");
  const [searchColaboradores, setSearchColaboradores] = useState<string>("");
  const [matrizSearchColab, setMatrizSearchColab] = useState<string>("");
  const [matrizSearchProj, setMatrizSearchProj] = useState<string>("");

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

  const aplicarFiltroRapido = (tipo: string) => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const dia = hoje.getDate();

    let inicio = "";
    let fim = "";

    switch (tipo) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-lg font-semibold text-gray-700">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const filteredData = data.filter((row) => {
    if (selectedColaborador !== "todos" && row.Colaborador !== selectedColaborador) return false;
    if (selectedProjeto !== "todos" && row.Projeto !== selectedProjeto) return false;
    if (dataInicio && row.Início < dataInicio) return false;
    if (dataFim && row.Fim > dataFim) return false;
    return true;
  });

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

  const tipoDataFull = Object.entries(tipoCount)
    .map(([name, value]) => ({ name, value, percent: (value / totalAtividades) * 100 }))
    .sort((a, b) => b.value - a.value);

  const tipoData = tipoDataFull.filter(item =>
    item.name.toLowerCase().includes(searchTipo.toLowerCase())
  );

  // Distribuição por Status
  const statusCount = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDataFull = Object.entries(statusCount)
    .map(([name, value]) => ({ name, value, percent: (value / totalAtividades) * 100 }))
    .sort((a, b) => b.value - a.value);

  const statusData = statusDataFull.filter(item =>
    item.name.toLowerCase().includes(searchStatus.toLowerCase())
  );

  // Rankings
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const rankingProjetosFull = Object.entries(projetoHoras)
    .map(([projeto, horas]) => ({ projeto, horas }))
    .sort((a, b) => b.horas - a.horas);

  const rankingProjetos = rankingProjetosFull.filter(item =>
    item.projeto.toLowerCase().includes(searchProjetos.toLowerCase())
  );

  const colaboradorHoras = filteredData.reduce((acc, r) => {
    acc[r.Colaborador] = (acc[r.Colaborador] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const rankingColaboradoresFull = Object.entries(colaboradorHoras)
    .map(([colaborador, horas]) => ({ colaborador, horas }))
    .sort((a, b) => b.horas - a.horas);

  const rankingColaboradores = rankingColaboradoresFull.filter(item =>
    item.colaborador.toLowerCase().includes(searchColaboradores.toLowerCase())
  );

  const topProjeto = rankingProjetosFull[0];
  const topColaborador = rankingColaboradoresFull[0];

  // Matriz
  const matrizData = filteredData.reduce((acc, r) => {
    const key = `${r.Colaborador}|||${r.Projeto}`;
    acc[key] = (acc[key] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const colaboradoresUnicosFull = Array.from(new Set(filteredData.map((r) => r.Colaborador))).sort();
  const projetosUnicosFull = Array.from(new Set(filteredData.map((r) => r.Projeto))).sort();

  const colaboradoresUnicos = colaboradoresUnicosFull.filter(c =>
    c.toLowerCase().includes(matrizSearchColab.toLowerCase())
  );
  const projetosUnicos = projetosUnicosFull.filter(p =>
    p.toLowerCase().includes(matrizSearchProj.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* Filtros Compactos */}
        <Card className="shadow-lg border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl animate-slide-down">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">De</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

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

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-600">Período</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => aplicarFiltroRapido("ultimos30")}
                    className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all hover:scale-105"
                  >
                    30d
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido("trimestre")}
                    className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all hover:scale-105"
                  >
                    Trim
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido("ano")}
                    className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all hover:scale-105"
                  >
                    Ano
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido("limpar")}
                    className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all hover:scale-105"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-xl border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl hover:shadow-2xl transition-all hover:scale-[1.02] duration-300 animate-slide-up">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Top Projeto</p>
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

          <Card className="shadow-xl border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl hover:shadow-2xl transition-all hover:scale-[1.02] duration-300 animate-slide-up" style={{animationDelay: '50ms'}}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
                  <Crown className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Top Colaborador</p>
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
          {[
            { label: "Total Horas", value: `${totalHoras.toFixed(1)}h`, icon: Clock, color: "blue-600" },
            { label: "Atividades", value: totalAtividades, icon: Activity, color: "blue-500" },
            { label: "Colaboradores", value: totalColaboradores, icon: Users, color: "blue-700" },
            { label: "Projetos", value: totalProjetos, icon: FolderKanban, color: "blue-800" },
            { label: "Taxa Conclusão", value: `${taxaConclusao.toFixed(1)}%`, icon: CheckCircle2, color: "blue-400" },
            { label: "Pontos Função", value: `${Math.round(totalPontosFuncao)}PF`, icon: Target, color: "blue-900" },
          ].map((kpi, idx) => (
            <Card
              key={kpi.label}
              className={`shadow-lg border-l-4 border-l-${kpi.color} bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all hover:-translate-y-1 duration-300 animate-slide-up`}
              style={{animationDelay: `${idx * 50}ms`}}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-bold text-${kpi.color} uppercase tracking-wide`}>{kpi.label}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-10 w-10 text-${kpi.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Listas Grid 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Distribuição por Tipo - LISTA */}
          <Card className="shadow-lg border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900">
                Distribuição por Tipo de Atividade
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar tipo..."
                  value={searchTipo}
                  onChange={(e) => setSearchTipo(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                {tipoData.map((item) => {
                  const originalIdx = tipoDataFull.findIndex(x => x.name === item.name);
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all hover:scale-[1.02] duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {originalIdx + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-blue-600">{item.value}</span>
                        <span className="text-xs text-gray-500">({item.percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ranking Projetos - TODOS */}
          <Card className="shadow-lg border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span>Ranking Projetos</span>
                <span className="text-xs font-normal text-gray-500">{rankingProjetos.length} projetos</span>
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar projeto..."
                  value={searchProjetos}
                  onChange={(e) => setSearchProjetos(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                {rankingProjetos.map((item) => {
                  const originalIdx = rankingProjetosFull.findIndex(x => x.projeto === item.projeto);
                  return (
                    <div
                      key={item.projeto}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all hover:scale-[1.02] duration-200"
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        originalIdx === 0 ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" :
                        originalIdx === 1 ? "bg-gradient-to-br from-blue-300 to-blue-500 text-white" :
                        originalIdx === 2 ? "bg-gradient-to-br from-blue-200 to-blue-400 text-white" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {originalIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.projeto}</p>
                      </div>
                      <div className="text-sm font-bold text-blue-600">{item.horas.toFixed(1)}h</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Status - LISTA */}
          <Card className="shadow-lg border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900">
                Distribuição por Status
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar status..."
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                {statusData.map((item) => {
                  const originalIdx = statusDataFull.findIndex(x => x.name === item.name);
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all hover:scale-[1.02] duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {originalIdx + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-blue-600">{item.value}</span>
                        <span className="text-xs text-gray-500">({item.percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ranking Colaboradores - Top 10 */}
          <Card className="shadow-lg border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span>Ranking Colaboradores</span>
                <span className="text-xs font-normal text-gray-500">{rankingColaboradores.length} colaboradores</span>
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchColaboradores}
                  onChange={(e) => setSearchColaboradores(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                {rankingColaboradores.map((item) => {
                  const originalIdx = rankingColaboradoresFull.findIndex(x => x.colaborador === item.colaborador);
                  return (
                    <div
                      key={item.colaborador}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all hover:scale-[1.02] duration-200"
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        originalIdx === 0 ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" :
                        originalIdx === 1 ? "bg-gradient-to-br from-blue-300 to-blue-500 text-white" :
                        originalIdx === 2 ? "bg-gradient-to-br from-blue-200 to-blue-400 text-white" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {originalIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.colaborador}</p>
                      </div>
                      <div className="text-sm font-bold text-blue-600">{item.horas.toFixed(1)}h</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matriz Colapsável com Filtros */}
        <Card className="shadow-lg border-2 border-blue-500/30 bg-slate-900/50 backdrop-blur-xl animate-fade-in">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsMatrizExpanded(!isMatrizExpanded)}
          >
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Colaborador × Projeto</span>
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
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Filtrar colaborador..."
                    value={matrizSearchColab}
                    onChange={(e) => setMatrizSearchColab(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Filtrar projeto..."
                    value={matrizSearchProj}
                    onChange={(e) => setMatrizSearchProj(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold sticky left-0 bg-blue-100 z-10">
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
                              className={`border border-gray-300 px-2 py-1 text-center transition-colors ${
                                horas > 0 ? "bg-blue-100 font-semibold text-blue-900 hover:bg-blue-200" : "text-gray-400"
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

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
