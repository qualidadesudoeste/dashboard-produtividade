/* Página de Ciclos de Teste - Gestão de Qualidade */

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bug,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TestTube,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";

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

interface CicloTeste {
  projeto: string;
  totalTestes: number;
  testesRealizados: number;
  testesPendentes: number;
  bugs: number;
  horasTeste: number;
  colaboradores: number;
  taxaConclusao: number;
  periodo: string;
  status: "concluido" | "em_andamento" | "pendente";
}

export default function CiclosTeste() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjeto, setSelectedProjeto] = useState<string>("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("todos");

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
          <p className="text-muted-foreground text-lg">Carregando ciclos de teste...</p>
        </div>
      </div>
    );
  }

  // Filtrar apenas atividades relacionadas a testes
  const atividadesTeste = data.filter((record) => {
    const isTeste = 
      record.Tipo.toLowerCase().includes("teste") ||
      record.Tipo.toLowerCase().includes("bug") ||
      record.Tipo.toLowerCase().includes("correção") ||
      record.Tipo.toLowerCase().includes("correcao") ||
      record.Atividade.toLowerCase().includes("teste") ||
      record.Atividade.toLowerCase().includes("bug");
    
    const matchProjeto = selectedProjeto === "todos" || record.Projeto === selectedProjeto;
    const matchPeriodo = selectedPeriodo === "todos" || record.Início.startsWith(selectedPeriodo);
    
    return isTeste && matchProjeto && matchPeriodo;
  });

  // Agrupar por projeto
  const projetosMap = atividadesTeste.reduce((acc, record) => {
    if (!acc[record.Projeto]) {
      acc[record.Projeto] = [];
    }
    acc[record.Projeto].push(record);
    return acc;
  }, {} as Record<string, DataRecord[]>);

  const ciclosTeste: CicloTeste[] = Object.entries(projetosMap).map(([projeto, registros]) => {
    const totalTestes = registros.length;
    const testesRealizados = registros.filter((r) => r.Status === "Concluído").length;
    const testesPendentes = totalTestes - testesRealizados;
    const bugs = registros.filter((r) => 
      r.Tipo.toLowerCase().includes("bug") || 
      r.Tipo.toLowerCase().includes("correção") ||
      r.Tipo.toLowerCase().includes("correcao")
    ).length;
    const horasTeste = registros.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
    const colaboradores = new Set(registros.map((r) => r.Colaborador)).size;
    const taxaConclusao = (testesRealizados / totalTestes) * 100;
    
    const periodos = registros.map((r) => r.Início.substring(0, 7));
    const periodoInicio = periodos.sort()[0];
    const periodoFim = periodos.sort()[periodos.length - 1];
    const periodo = periodoInicio === periodoFim ? periodoInicio : `${periodoInicio} a ${periodoFim}`;

    let status: "concluido" | "em_andamento" | "pendente" = "em_andamento";
    if (taxaConclusao === 100) status = "concluido";
    else if (taxaConclusao === 0) status = "pendente";

    return {
      projeto,
      totalTestes,
      testesRealizados,
      testesPendentes,
      bugs,
      horasTeste,
      colaboradores,
      taxaConclusao,
      periodo,
      status,
    };
  });

  // Ordenar por taxa de conclusão (menor primeiro)
  const ciclosOrdenados = ciclosTeste.sort((a, b) => a.taxaConclusao - b.taxaConclusao);

  // Métricas Gerais
  const totalCiclos = ciclosTeste.length;
  const ciclosConcluidos = ciclosTeste.filter((c) => c.status === "concluido").length;
  const ciclosEmAndamento = ciclosTeste.filter((c) => c.status === "em_andamento").length;
  const ciclosPendentes = ciclosTeste.filter((c) => c.status === "pendente").length;
  const totalTestesRealizados = ciclosTeste.reduce((sum, c) => sum + c.testesRealizados, 0);
  const totalTestes = ciclosTeste.reduce((sum, c) => sum + c.totalTestes, 0);
  const totalBugs = ciclosTeste.reduce((sum, c) => sum + c.bugs, 0);
  const totalHorasTeste = ciclosTeste.reduce((sum, c) => sum + c.horasTeste, 0);
  const taxaGeral = totalTestes > 0 ? (totalTestesRealizados / totalTestes) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluido":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>;
      case "em_andamento":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Em Andamento</Badge>;
      case "pendente":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pendente</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "em_andamento":
        return <TestTube className="h-5 w-5 text-blue-500" />;
      case "pendente":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <TestTube className="h-5 w-5 text-gray-500" />;
    }
  };

  const projetos = ["todos", ...Array.from(new Set(data.map((r) => r.Projeto))).sort()];

  const formatarPeriodo = (periodo: string) => {
    if (periodo === "todos") return "Todos os Períodos";
    const [ano, mes] = periodo.split("-");
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Projeto</label>
              <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                <SelectTrigger>
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

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 hover-scale border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TestTube className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Ciclos</p>
                <p className="text-2xl font-bold">{totalCiclos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-scale border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Concluídos</p>
                <p className="text-2xl font-bold">{ciclosConcluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-scale border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Em Andamento</p>
                <p className="text-2xl font-bold">{ciclosEmAndamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-scale border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Bug className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bugs</p>
                <p className="text-2xl font-bold">{totalBugs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Taxa de Conclusão Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Testes Realizados</span>
                <span className="text-2xl font-bold">{taxaGeral.toFixed(1)}%</span>
              </div>
              <Progress value={taxaGeral} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {totalTestesRealizados} de {totalTestes} testes concluídos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Horas em Testes</p>
                <p className="text-xl font-bold">{totalHorasTeste.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Média h/Teste</p>
                <p className="text-xl font-bold">
                  {totalTestes > 0 ? (totalHorasTeste / totalTestes).toFixed(1) : "0.0"}h
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ciclos Pendentes</p>
                <p className="text-xl font-bold">{ciclosPendentes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Taxa Bugs/Teste</p>
                <p className="text-xl font-bold">
                  {totalTestes > 0 ? ((totalBugs / totalTestes) * 100).toFixed(1) : "0.0"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ciclos de Teste */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Ciclos de Teste por Projeto</h2>
        <div className="space-y-4">
          {ciclosOrdenados.map((ciclo, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(ciclo.status)}
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ciclo.projeto}</CardTitle>
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(ciclo.status)}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {ciclo.periodo}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ciclo.colaboradores} testador{ciclo.colaboradores !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{ciclo.taxaConclusao.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Conclusão</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <Progress value={ciclo.taxaConclusao} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ciclo.testesRealizados} realizados</span>
                      <span>{ciclo.totalTestes} total</span>
                    </div>
                  </div>

                  {/* Métricas do Ciclo */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Testes</p>
                      <p className="text-lg font-semibold">{ciclo.totalTestes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Realizados</p>
                      <p className="text-lg font-semibold text-emerald-500">{ciclo.testesRealizados}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
                      <p className="text-lg font-semibold text-amber-500">{ciclo.testesPendentes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bugs</p>
                      <p className="text-lg font-semibold text-red-500">{ciclo.bugs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Horas</p>
                      <p className="text-lg font-semibold">{ciclo.horasTeste.toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {ciclosOrdenados.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhum ciclo de teste encontrado para os filtros selecionados.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
