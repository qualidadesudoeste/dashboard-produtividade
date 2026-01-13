/* Página de Auditoria de Projetos - Status Report de Qualidade */

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
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Target,
  BarChart3,
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

interface ProjetoQualidade {
  nome: string;
  totalHoras: number;
  totalAtividades: number;
  atividadesConcluidas: number;
  atividadesEmAndamento: number;
  atividadesPendentes: number;
  colaboradores: number;
  pontosFuncao: number;
  taxaConclusao: number;
  mediaHorasPorAtividade: number;
  status: "excelente" | "bom" | "atencao" | "critico";
}

export default function Auditoria() {
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
          <p className="text-muted-foreground text-lg">Carregando dados de auditoria...</p>
        </div>
      </div>
    );
  }

  const filteredData = data.filter((record) => {
    const matchProjeto = selectedProjeto === "todos" || record.Projeto === selectedProjeto;
    const matchPeriodo = selectedPeriodo === "todos" || record.Início.startsWith(selectedPeriodo);
    return matchProjeto && matchPeriodo;
  });

  // Análise por Projeto
  const projetosMap = filteredData.reduce((acc, record) => {
    if (!acc[record.Projeto]) {
      acc[record.Projeto] = [];
    }
    acc[record.Projeto].push(record);
    return acc;
  }, {} as Record<string, DataRecord[]>);

  const projetosQualidade: ProjetoQualidade[] = Object.entries(projetosMap).map(([nome, registros]) => {
    const totalHoras = registros.reduce((sum, r) => sum + r.Horas_Trabalhadas, 0);
    const totalAtividades = registros.length;
    const atividadesConcluidas = registros.filter((r) => r.Status === "Concluído").length;
    const atividadesEmAndamento = registros.filter((r) => r.Status === "Em Andamento" || r.Status === "Fazendo").length;
    const atividadesPendentes = registros.filter((r) => r.Status !== "Concluído" && r.Status !== "Em Andamento" && r.Status !== "Fazendo").length;
    const colaboradores = new Set(registros.map((r) => r.Colaborador)).size;
    const pontosFuncao = registros.reduce((sum, r) => sum + (r.PF || 0), 0);
    const taxaConclusao = (atividadesConcluidas / totalAtividades) * 100;
    const mediaHorasPorAtividade = totalHoras / totalAtividades;

    let status: "excelente" | "bom" | "atencao" | "critico" = "bom";
    if (taxaConclusao >= 90) status = "excelente";
    else if (taxaConclusao >= 70) status = "bom";
    else if (taxaConclusao >= 50) status = "atencao";
    else status = "critico";

    return {
      nome,
      totalHoras,
      totalAtividades,
      atividadesConcluidas,
      atividadesEmAndamento,
      atividadesPendentes,
      colaboradores,
      pontosFuncao,
      taxaConclusao,
      mediaHorasPorAtividade,
      status,
    };
  });

  // Ordenar por status (crítico primeiro) e depois por taxa de conclusão
  const projetosOrdenados = projetosQualidade.sort((a, b) => {
    const statusOrder = { critico: 0, atencao: 1, bom: 2, excelente: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.taxaConclusao - b.taxaConclusao;
  });

  // Métricas Gerais
  const totalProjetos = projetosQualidade.length;
  const projetosExcelentes = projetosQualidade.filter((p) => p.status === "excelente").length;
  const projetosBons = projetosQualidade.filter((p) => p.status === "bom").length;
  const projetosAtencao = projetosQualidade.filter((p) => p.status === "atencao").length;
  const projetosCriticos = projetosQualidade.filter((p) => p.status === "critico").length;
  const taxaQualidadeGeral = totalProjetos > 0 
    ? ((projetosExcelentes + projetosBons) / totalProjetos) * 100 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excelente":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Excelente</Badge>;
      case "bom":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Bom</Badge>;
      case "atencao":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Atenção</Badge>;
      case "critico":
        return <Badge className="bg-red-500 hover:bg-red-600">Crítico</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excelente":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "bom":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "atencao":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "critico":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

      {/* Métricas Gerais de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 hover-lift border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Projetos</p>
                <p className="text-2xl font-bold">{totalProjetos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-lift border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Excelentes</p>
                <p className="text-2xl font-bold">{projetosExcelentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-lift border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bons</p>
                <p className="text-2xl font-bold">{projetosBons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-lift border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Atenção</p>
                <p className="text-2xl font-bold">{projetosAtencao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover-lift border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Críticos</p>
                <p className="text-2xl font-bold">{projetosCriticos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Índice de Qualidade Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Índice de Qualidade Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxa de Projetos Saudáveis (Excelente + Bom)</span>
              <span className="text-2xl font-bold">{taxaQualidadeGeral.toFixed(1)}%</span>
            </div>
            <Progress value={taxaQualidadeGeral} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {projetosExcelentes + projetosBons} de {totalProjetos} projetos estão com qualidade satisfatória
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos com Status de Qualidade */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Status Report por Projeto</h2>
        <div className="space-y-4">
          {projetosOrdenados.map((projeto, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(projeto.status)}
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{projeto.nome}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(projeto.status)}
                        <span className="text-sm text-muted-foreground">
                          {projeto.colaboradores} colaborador{projeto.colaboradores !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{projeto.taxaConclusao.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <Progress value={projeto.taxaConclusao} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{projeto.atividadesConcluidas} concluídas</span>
                      <span>{projeto.totalAtividades} total</span>
                    </div>
                  </div>

                  {/* Métricas do Projeto */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total de Horas</p>
                      <p className="text-lg font-semibold">{projeto.totalHoras.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Atividades</p>
                      <p className="text-lg font-semibold">{projeto.totalAtividades}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Média h/Atividade</p>
                      <p className="text-lg font-semibold">{projeto.mediaHorasPorAtividade.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pontos de Função</p>
                      <p className="text-lg font-semibold">{projeto.pontosFuncao.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Status das Atividades */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Concluídas</p>
                        <p className="text-sm font-semibold">{projeto.atividadesConcluidas}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Em Andamento</p>
                        <p className="text-sm font-semibold">{projeto.atividadesEmAndamento}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pendentes</p>
                        <p className="text-sm font-semibold">{projeto.atividadesPendentes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
