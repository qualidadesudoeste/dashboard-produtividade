/* Dashboard Gerencial - Design limpo, organizado e intuitivo */

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
} from "recharts";
import { Clock, Activity, FolderKanban, Users, Moon, Sun, TrendingUp, CheckCircle2 } from "lucide-react";
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

const CHART_COLOR = "#3B82F6";
const CHART_COLOR_SECONDARY = "#10B981";

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
  const totalColaboradores = new Set(filteredData.map((r) => r.Colaborador)).size;
  const totalProjetos = new Set(filteredData.map((r) => r.Projeto)).size;
  const mediaHoras = totalAtividades > 0 ? totalHoras / totalAtividades : 0;
  const taxaConclusao = totalAtividades > 0
    ? (filteredData.filter((r) => r.Status === "Concluído").length / totalAtividades) * 100
    : 0;

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

  // Matriz de Alocação (Top 8 de cada)
  const top8Colaboradores = Object.entries(colaboradorHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([nome]) => nome);
  
  const top8Projetos = Object.entries(projetoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([nome]) => nome);

  const matrizAlocacao = top8Colaboradores.map(colab => {
    const row: any = { colaborador: colab.split(" ").slice(0, 2).join(" ") };
    top8Projetos.forEach(proj => {
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
      top8Projetos.map(proj => row[proj] || 0)
    ));
    const ratio = value / max;
    if (ratio > 0.75) return "rgba(59, 130, 246, 0.9)";
    if (ratio > 0.5) return "rgba(59, 130, 246, 0.6)";
    if (ratio > 0.25) return "rgba(59, 130, 246, 0.4)";
    return "rgba(59, 130, 246, 0.2)";
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
    <div className="space-y-8">
        {/* Filtros em linha única */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Colaborador</label>
                <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Projeto</label>
                <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                  <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principais - 2 linhas de 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Horas</p>
                  <p className="text-3xl font-bold">{totalHoras.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Activity className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Atividades</p>
                  <p className="text-3xl font-bold">{totalAtividades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Colaboradores</p>
                  <p className="text-3xl font-bold">{totalColaboradores}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <FolderKanban className="h-7 w-7 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projetos</p>
                  <p className="text-3xl font-bold">{totalProjetos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Média h/Atividade</p>
                  <p className="text-3xl font-bold">{mediaHoras.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Taxa Conclusão</p>
                  <p className="text-3xl font-bold">{taxaConclusao.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção: Rankings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Rankings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Projetos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Projetos por Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={top10Projetos} layout="vertical" margin={{ left: 150, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }} />
                    <YAxis 
                      dataKey="nome" 
                      type="category" 
                      width={140}
                      tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top 10 Colaboradores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Colaboradores por Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={top10Colaboradores} layout="vertical" margin={{ left: 100, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }} />
                    <YAxis 
                      dataKey="nome" 
                      type="category" 
                      width={90}
                      tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR_SECONDARY} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção: Distribuições */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Distribuições</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Tipo */}
            <Card>
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
                    <YAxis tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                    <Bar dataKey="horas" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Status */}
            <Card>
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
                    <YAxis tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }} 
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
          <h2 className="text-2xl font-bold mb-4">Matriz de Alocação</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colaborador × Projeto (Top 8)</CardTitle>
              <p className="text-sm text-muted-foreground">Horas trabalhadas por colaborador em cada projeto</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-3 font-semibold sticky left-0 bg-card">Colaborador</th>
                      {top8Projetos.map((proj, idx) => (
                        <th key={idx} className="text-center p-3 font-semibold text-sm">
                          <div className="w-24 truncate" title={proj}>
                            {proj.substring(0, 15)}...
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrizAlocacao.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium sticky left-0 bg-card">{row.colaborador}</td>
                        {top8Projetos.map((proj, pIdx) => {
                          const value = row[proj] || 0;
                          return (
                            <td 
                              key={pIdx} 
                              className="p-3 text-center font-mono text-sm font-semibold"
                              style={{ 
                                backgroundColor: getHeatmapColor(value),
                                color: value > 0 ? '#fff' : 'inherit'
                              }}
                            >
                              {value > 0 ? value.toFixed(1) : "-"}
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
