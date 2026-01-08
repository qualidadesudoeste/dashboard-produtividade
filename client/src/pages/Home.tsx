/* Swiss Precision Dashboard - Grid rigoroso 8px, tipografia hierárquica, assimetria calculada */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Clock, Users, FolderKanban, Activity, TrendingUp, CheckCircle2 } from "lucide-react";

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

const COLORS = ["#0A84FF", "#5AC8FA", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#FF2D55"];

export default function Home() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColaborador, setSelectedColaborador] = useState<string>("todos");
  const [selectedProjeto, setSelectedProjeto] = useState<string>("todos");

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Filtrar dados
  const filteredData = data.filter((record) => {
    const matchColaborador = selectedColaborador === "todos" || record.Colaborador === selectedColaborador;
    const matchProjeto = selectedProjeto === "todos" || record.Projeto === selectedProjeto;
    return matchColaborador && matchProjeto;
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
    .map(([nome, horas]) => ({ nome, horas: Number(horas.toFixed(2)) }));

  // Top 10 Projetos
  const projetoHoras = filteredData.reduce((acc, r) => {
    acc[r.Projeto] = (acc[r.Projeto] || 0) + r.Horas_Trabalhadas;
    return acc;
  }, {} as Record<string, number>);

  const top10Projetos = Object.entries(projetoHoras)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([nome, horas]) => ({ nome: nome.substring(0, 30), horas: Number(horas.toFixed(2)) }));

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-8">
          <h1 className="text-5xl font-bold tracking-tight mb-2">Dashboard Gerencial</h1>
          <p className="text-muted-foreground text-lg">Análise de Produtividade por Colaborador e Projeto</p>
        </div>
      </header>

      {/* Filtros */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="text-sm font-medium mb-2 block">Colaborador</label>
              <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "todos" ? "Todos os Colaboradores" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[280px]">
              <label className="text-sm font-medium mb-2 block">Projeto</label>
              <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p === "todos" ? "Todos os Projetos" : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Horas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{totalHoras.toFixed(2)}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Atividades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{totalAtividades}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{totalColaboradores}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projetos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{totalProjetos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média h/Atividade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{mediaHorasPorAtividade.toFixed(2)}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Conclusão</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{taxaConclusao.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos */}
      <div className="container pb-16">
        <Tabs defaultValue="colaboradores" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
            <TabsTrigger value="projetos">Projetos</TabsTrigger>
            <TabsTrigger value="tipos">Tipos</TabsTrigger>
            <TabsTrigger value="temporal">Temporal</TabsTrigger>
          </TabsList>

          <TabsContent value="colaboradores" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Top 15 Colaboradores por Horas Trabalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={top15Colaboradores} layout="vertical" margin={{ left: 200, right: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis type="number" stroke="#8E8E93" />
                    <YAxis dataKey="nome" type="category" width={190} stroke="#8E8E93" style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="horas" fill="#0A84FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projetos" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Projetos por Horas Trabalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={top10Projetos} margin={{ bottom: 120, top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={120} stroke="#8E8E93" style={{ fontSize: 11 }} />
                    <YAxis stroke="#8E8E93" />
                    <Tooltip />
                    <Bar dataKey="horas" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tipos" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={distribuicaoTipo}
                        dataKey="horas"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => `${entry.nome.substring(0, 20)}`}
                      >
                        {distribuicaoTipo.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={distribuicaoStatus}
                        dataKey="horas"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label
                      >
                        {distribuicaoStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Temporal de Horas Trabalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={evolucaoTemporal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis dataKey="mes" stroke="#8E8E93" />
                    <YAxis stroke="#8E8E93" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="horas" stroke="#0A84FF" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
