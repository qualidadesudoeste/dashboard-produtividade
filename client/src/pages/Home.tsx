/* Dashboard de Gestão - Estilo grid compacto com matriz de alocação */

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Cell,
} from "recharts";
import { Clock, Activity, FolderKanban, Users, Moon, Sun, Calendar } from "lucide-react";
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

const CHART_COLOR = "#5AC8FA";
const HEATMAP_COLORS = {
  low: "#1E3A5F",
  medium: "#2E5A8F",
  high: "#3E7ABF",
  veryHigh: "#5AC8FA"
};

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

  const totalHoras = filteredData.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
  const totalAtividades = filteredData.length;

  // Top Projeto
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const topProjeto = Object.entries(projetoHoras).sort(([, a], [, b]) => b - a)[0];

  // Top Colaborador
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
      nome: nome.length > 20 ? nome.substring(0, 20) + "..." : nome, 
      horas: Number(horas.toFixed(0)) 
    }));

  // Top 10 Colaboradores
  const top10Colaboradores = Object.entries(colaboradorHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([nome, horas]) => ({ 
      nome: nome.split(" ")[0] + " " + (nome.split(" ")[1] || ""),
      horas: Number(horas.toFixed(0)) 
    }));

  // Distribuição por Tipo
  const tipoHoras = filteredData.reduce((acc, r) => {
    acc[r.Tipo] = (acc[r.Tipo] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const distribuicaoTipo = Object.entries(tipoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([nome, horas]) => ({ 
      nome: nome.length > 15 ? nome.substring(0, 15) + "..." : nome,
      horas: Number(horas.toFixed(0)) 
    }));

  // Distribuição por Status
  const statusHoras = filteredData.reduce((acc, r) => {
    acc[r.Status] = (acc[r.Status] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);
  const distribuicaoStatus = Object.entries(statusHoras)
    .sort(([, a], [, b]) => b - a)
    .map(([nome, horas]) => ({ nome, horas: Number(horas.toFixed(0)) }));

  // Matriz de Alocação (Colaborador x Projeto) - Top 6 de cada
  const top6Colaboradores = Object.entries(colaboradorHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([nome]) => nome);
  
  const top6Projetos = Object.entries(projetoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([nome]) => nome);

  const matrizAlocacao = top6Colaboradores.map(colab => {
    const row: any = { colaborador: colab.split(" ")[0] + " " + (colab.split(" ")[1] || "") };
    top6Projetos.forEach(proj => {
      const horas = filteredData
        .filter(r => r.Colaborador === colab && r.Projeto === proj)
        .reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
      row[proj] = horas;
    });
    return row;
  });

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "transparent";
    const max = Math.max(...matrizAlocacao.flatMap(row => 
      top6Projetos.map(proj => row[proj] || 0)
    ));
    const ratio = value / max;
    if (ratio > 0.75) return HEATMAP_COLORS.veryHigh;
    if (ratio > 0.5) return HEATMAP_COLORS.high;
    if (ratio > 0.25) return HEATMAP_COLORS.medium;
    return HEATMAP_COLORS.low;
  };

  const colaboradores = ["todos", ...Array.from(new Set(data.map((r) => r.Colaborador))).sort()];
  const projetos = ["todos", ...Array.from(new Set(data.map((r) => r.Projeto))).sort()];

  const formatarPeriodo = (periodo: string) => {
    if (periodo === "todos") return "Todos os Períodos";
    const [ano, mes] = periodo.split("-");
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold tracking-tight">
            DASHBOARD DE GESTÃO DE PROJETOS E EQUIPE
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-lg border-gray-700"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
            <SelectTrigger className="h-10 bg-[#1A1F2E] border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colaboradores.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "todos" ? "Todos os Colaboradores" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
            <SelectTrigger className="h-10 bg-[#1A1F2E] border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projetos.map((p) => (
                <SelectItem key={p} value={p}>
                  {p === "todos" ? "Todos os Projetos" : p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
            <SelectTrigger className="h-10 bg-[#1A1F2E] border-gray-700">
              <SelectValue />
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

        {/* KPIs Compactos */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1A1F2E] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-[#2A3F5F] flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#5AC8FA]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Total Horas</p>
                  <p className="text-2xl font-bold">{totalHoras.toFixed(0)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F2E] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-[#2A3F5F] flex items-center justify-center">
                  <Activity className="h-6 w-6 text-[#5AC8FA]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Total Atividades</p>
                  <p className="text-2xl font-bold">{totalAtividades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F2E] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-[#2A3F5F] flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-[#5AC8FA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase">Top Projeto</p>
                  <p className="text-lg font-bold truncate">
                    {topProjeto ? topProjeto[0].substring(0, 25) : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F2E] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-[#2A3F5F] flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#5AC8FA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase">Top Colaborador</p>
                  <p className="text-lg font-bold truncate">
                    {topColaborador ? topColaborador[0].split(" ").slice(0, 2).join(" ") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Top 10 Projetos */}
        <Card className="bg-[#1A1F2E] border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">TOP 10 PROJETOS POR HORAS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={top10Projetos} margin={{ left: 10, right: 10, top: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3F5F" vertical={false} />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  stroke="#2A3F5F"
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} stroke="#2A3F5F" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2E', 
                    border: '1px solid #2A3F5F',
                    borderRadius: '6px',
                    color: '#FFF'
                  }} 
                />
                <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Colaboradores */}
        <Card className="bg-[#1A1F2E] border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">TOP 10 COLABORADORES POR HORAS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={top10Colaboradores} margin={{ left: 10, right: 10, top: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3F5F" vertical={false} />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  stroke="#2A3F5F"
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} stroke="#2A3F5F" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2E', 
                    border: '1px solid #2A3F5F',
                    borderRadius: '6px',
                    color: '#FFF'
                  }} 
                />
                <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card className="bg-[#1A1F2E] border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">DISTRIBUIÇÃO POR TIPO DE ATIVIDADE</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={distribuicaoTipo} margin={{ left: 10, right: 10, top: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3F5F" vertical={false} />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  stroke="#2A3F5F"
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} stroke="#2A3F5F" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2E', 
                    border: '1px solid #2A3F5F',
                    borderRadius: '6px',
                    color: '#FFF'
                  }} 
                />
                <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card className="bg-[#1A1F2E] border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">DISTRIBUIÇÃO DE HORAS POR STATUS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={distribuicaoStatus} margin={{ left: 10, right: 10, top: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3F5F" vertical={false} />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  stroke="#2A3F5F"
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} stroke="#2A3F5F" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2E', 
                    border: '1px solid #2A3F5F',
                    borderRadius: '6px',
                    color: '#FFF'
                  }} 
                />
                <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Matriz de Alocação (Heatmap) */}
        <Card className="bg-[#1A1F2E] border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">MATRIZ DE ALOCAÇÃO (COLABORADOR x PROJETO)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 text-gray-400 font-medium">Colaborador</th>
                    {top6Projetos.map((proj, idx) => (
                      <th key={idx} className="text-center p-2 text-gray-400 font-medium">
                        {proj.substring(0, 12)}...
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrizAlocacao.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="p-2 font-medium">{row.colaborador}</td>
                      {top6Projetos.map((proj, pIdx) => {
                        const value = row[proj] || 0;
                        return (
                          <td 
                            key={pIdx} 
                            className="p-2 text-center font-mono"
                            style={{ 
                              backgroundColor: getHeatmapColor(value),
                              border: '1px solid #1A1F2E'
                            }}
                          >
                            {value > 0 ? value.toFixed(0) : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
