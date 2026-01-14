/**
 * Página de Auditoria de Sprints
 * - Auditorias por Sprint usando Checklist Maker Compass (14 critérios)
 * - Visualizar histórico de auditorias
 * - Gerenciar status de qualidade das sprints
 */

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  Trash2,
  Pencil,
  FileCheck,
  BarChart3,
  TrendingUp,
  Calendar,
  X,
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

interface Checklist {
  makerCompass: boolean;
  especificacaoRequisitos: boolean;
  planejamentSprint: boolean;
  cardsCriados: boolean;
  estimativasPlanningPoker: boolean;
  tempoMaximoCard: boolean;
  playPauseRegistro: boolean;
  impedimentosRegistrados: boolean;
  dailyEquipe: boolean;
  dailyCliente: boolean;
  contagemPF: boolean;
  qaTestou100: boolean;
  reviewRealizada: boolean;
  retrospectiva: boolean;
  sprintQuinzenal: boolean;
}

interface Auditoria {
  id: string;
  projeto: string;
  sprint: string;
  dataInicio: string;
  dataFim: string;
  duracao: number;
  data: string;
  auditor: string;
  checklist: Checklist;
  scoreTotal: number;
  status: "Aprovado" | "Aprovado com Ressalvas" | "Reprovado";
  observacoes: string;
  acoesCorretivas: string;
}

const CRITERIOS_LABELS = [
  "Maker Compass",
  "Especificação de Requisitos",
  "Planejamento da Sprint (Planning)",
  "Cards criados no SIG",
  "Estimativas feitas via Planning Poker",
  "Tempo máximo por card ≤ 420 min (7h)",
  "Devs utilizam Play/Pause no SIG e registram % de evolução",
  "Impedimentos registrados no SIG",
  "Daily-E (Equipe)",
  "Daily-C (Cliente)",
  "Contagem de PF realizada com o plugin",
  "QA testou 100% da Sprint antes da entrega",
  "Review realizada com cliente e time completo",
  "Retrospectiva realizada ao final da Sprint",
  "Sprint Quinzenal (≤ 15 dias)",
];

const CRITERIOS_KEYS: (keyof Checklist)[] = [
  "makerCompass",
  "especificacaoRequisitos",
  "planejamentSprint",
  "cardsCriados",
  "estimativasPlanningPoker",
  "tempoMaximoCard",
  "playPauseRegistro",
  "impedimentosRegistrados",
  "dailyEquipe",
  "dailyCliente",
  "contagemPF",
  "qaTestou100",
  "reviewRealizada",
  "retrospectiva",
  "sprintQuinzenal",
];

// Função auxiliar para converter data DD/MM/YYYY para YYYY-MM-DD
const converterParaFormatoISO = (data: string): string => {
  if (!data) return "";
  
  // Se já está no formato YYYY-MM-DD, retorna
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
  
  // Se está no formato DD/MM/YYYY, converte
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }
  
  return "";
};

export default function Auditoria() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAuditoria, setSelectedAuditoria] = useState<Auditoria | null>(null);
  const [editandoAuditoria, setEditandoAuditoria] = useState<Auditoria | null>(null);
  const [filtroProj, setFiltroProj] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Form state
  const [formData, setFormData] = useState({
    projeto: "",
    sprint: "",
    dataInicio: "",
    dataFim: "",
    duracao: 0,
    data: new Date().toISOString().split("T")[0],
    auditor: "",
    checklist: {
      makerCompass: false,
      especificacaoRequisitos: false,
      planejamentSprint: false,
      cardsCriados: false,
      estimativasPlanningPoker: false,
      tempoMaximoCard: false,
      playPauseRegistro: false,
      impedimentosRegistrados: false,
      dailyEquipe: false,
      dailyCliente: false,
      contagemPF: false,
      qaTestou100: false,
      reviewRealizada: false,
      retrospectiva: false,
      sprintQuinzenal: false,
    },
    observacoes: "",
    acoesCorretivas: "",
  });

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      });

    // Carregar auditorias do localStorage
    const savedAuditorias = localStorage.getItem("auditorias");
    if (savedAuditorias) {
      setAuditorias(JSON.parse(savedAuditorias));
    }
  }, []);

  // Rotina automática: criar auditorias vazias para sprints dos Ciclos de Teste
  useEffect(() => {
    if (auditorias.length > 0) return; // Executar apenas se não houver auditorias

    fetch("/ciclos_teste.json")
      .then((res) => res.json())
      .then((ciclosData) => {
        const novasAuditorias: Auditoria[] = [];

        ciclosData.forEach((ciclo: any) => {
          const projeto = ciclo.projeto;
          const sprint = ciclo.sprint;

          // Verificar se já existe auditoria para este projeto+sprint
          const jaExiste = auditorias.some(
            (aud) => aud.projeto === projeto && aud.sprint === sprint
          );

          if (!jaExiste) {
            novasAuditorias.push({
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              projeto,
              sprint,
              dataInicio: converterParaFormatoISO(ciclo.inicio || ""),
              dataFim: converterParaFormatoISO(ciclo.fim || ""),
              duracao: ciclo.duracao || 0,
              data: new Date().toISOString().split("T")[0],
              auditor: "Pendente",
              checklist: {
                makerCompass: false,
                especificacaoRequisitos: false,
                planejamentSprint: false,
                cardsCriados: false,
                estimativasPlanningPoker: false,
                tempoMaximoCard: false,
                playPauseRegistro: false,
                impedimentosRegistrados: false,
                dailyEquipe: false,
                dailyCliente: false,
                contagemPF: false,
                qaTestou100: false,
                reviewRealizada: false,
                retrospectiva: false,
                sprintQuinzenal: false,
              },
              scoreTotal: 0,
              status: "Reprovado",
              observacoes: "",
              acoesCorretivas: "",
            });
          }
        });

        if (novasAuditorias.length > 0) {
          const todasAuditorias = [...auditorias, ...novasAuditorias];
          setAuditorias(todasAuditorias);
          localStorage.setItem("auditorias", JSON.stringify(todasAuditorias));
          console.log(`✅ ${novasAuditorias.length} auditorias criadas automaticamente`);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar ciclos de teste:", error);
      });
  }, [auditorias]);

  const projetos = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.Projeto))).sort();
  }, [data]);

  const calcularScore = (checklist: Checklist): number => {
    const total = CRITERIOS_KEYS.length;
    const marcados = CRITERIOS_KEYS.filter((key) => checklist[key]).length;
    return Math.round((marcados / total) * 100 * 10) / 10; // 1 casa decimal
  };

  const determinarStatus = (score: number): "Aprovado" | "Aprovado com Ressalvas" | "Reprovado" => {
    if (score >= 80) return "Aprovado";
    if (score >= 60) return "Aprovado com Ressalvas";
    return "Reprovado";
  };

  const handleChecklistChange = (key: keyof Checklist, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: checked,
      },
    }));
  };

  const handleSalvarAuditoria = () => {
    if (!formData.projeto || !formData.sprint || !formData.auditor) {
      alert("Por favor, preencha Projeto, Sprint e Auditor.");
      return;
    }

    const scoreTotal = calcularScore(formData.checklist);
    const status = determinarStatus(scoreTotal);

    if (editandoAuditoria) {
      // EDITAR: atualizar registro existente
      const auditoriaAtualizada: Auditoria = {
        id: editandoAuditoria.id,
        projeto: formData.projeto,
        sprint: formData.sprint,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        duracao: formData.duracao,
        data: formData.data,
        auditor: formData.auditor,
        checklist: { ...formData.checklist },
        scoreTotal,
        status,
        observacoes: formData.observacoes,
        acoesCorretivas: formData.acoesCorretivas,
      };

      const auditoriasAtualizadas = auditorias.map((aud) =>
        aud.id === editandoAuditoria.id ? auditoriaAtualizada : aud
      );
      setAuditorias(auditoriasAtualizadas);
      localStorage.setItem("auditorias", JSON.stringify(auditoriasAtualizadas));
      setEditandoAuditoria(null);
    } else {
      // CRIAR: adicionar novo registro
      const novaAuditoria: Auditoria = {
        id: Date.now().toString(),
        projeto: formData.projeto,
        sprint: formData.sprint,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        duracao: formData.duracao,
        data: formData.data,
        auditor: formData.auditor,
        checklist: { ...formData.checklist },
        scoreTotal,
        status,
        observacoes: formData.observacoes,
        acoesCorretivas: formData.acoesCorretivas,
      };

      const novasAuditorias = [...auditorias, novaAuditoria];
      setAuditorias(novasAuditorias);
      localStorage.setItem("auditorias", JSON.stringify(novasAuditorias));
    }

    // Reset form
    setFormData({
      projeto: "",
      sprint: "",
      dataInicio: "",
      dataFim: "",
      duracao: 0,
      data: new Date().toISOString().split("T")[0],
      auditor: "",
      checklist: {
        makerCompass: false,
        especificacaoRequisitos: false,
        planejamentSprint: false,
        cardsCriados: false,
        estimativasPlanningPoker: false,
        tempoMaximoCard: false,
        playPauseRegistro: false,
        impedimentosRegistrados: false,
        dailyEquipe: false,
        dailyCliente: false,
        contagemPF: false,
        qaTestou100: false,
        reviewRealizada: false,
        retrospectiva: false,
        sprintQuinzenal: false,
      },
      observacoes: "",
      acoesCorretivas: "",
    });

    setIsFormOpen(false);
  };

  const handleEditarAuditoria = (auditoria: Auditoria) => {
    setEditandoAuditoria(auditoria);
    setFormData({
      projeto: auditoria.projeto,
      sprint: auditoria.sprint,
      dataInicio: auditoria.dataInicio,
      dataFim: auditoria.dataFim,
      duracao: auditoria.duracao,
      data: auditoria.data,
      auditor: auditoria.auditor,
      checklist: { ...auditoria.checklist },
      observacoes: auditoria.observacoes,
      acoesCorretivas: auditoria.acoesCorretivas,
    });
    setIsFormOpen(true);
  };

  const handleExcluirAuditoria = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta auditoria?")) {
      const novasAuditorias = auditorias.filter((a) => a.id !== id);
      setAuditorias(novasAuditorias);
      localStorage.setItem("auditorias", JSON.stringify(novasAuditorias));
    }
  };

  const auditoriasFiltradas = useMemo(() => {
    return auditorias.filter((aud) => {
      const matchProj = filtroProj === "todos" || aud.projeto === filtroProj;
      const matchStatus = filtroStatus === "todos" || aud.status === filtroStatus;
      return matchProj && matchStatus;
    });
  }, [auditorias, filtroProj, filtroStatus]);

  const kpis = useMemo(() => {
    const total = auditorias.length;
    const aprovadas = auditorias.filter((a) => a.status === "Aprovado").length;
    const taxaConformidade = total > 0 ? Math.round((aprovadas / total) * 100 * 10) / 10 : 0;
    const criticos = auditorias.filter((a) => a.scoreTotal < 60).length;
    const ultimaAuditoria = auditorias.length > 0
      ? auditorias.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0].data
      : "N/A";

    return { total, taxaConformidade, criticos, ultimaAuditoria };
  }, [auditorias]);

  const scoreAtual = useMemo(() => {
    return calcularScore(formData.checklist);
  }, [formData.checklist]);

  const statusAtual = useMemo(() => {
    return determinarStatus(scoreAtual);
  }, [scoreAtual]);

  const itensAtendidos = useMemo(() => {
    return CRITERIOS_KEYS.filter((key) => formData.checklist[key]).length;
  }, [formData.checklist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Status de Conformidade Maker Express</h1>
            <p className="text-gray-600 mt-1"></p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Auditoria
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">TOTAL AUDITORIAS</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.total}</p>
                </div>
                <FileCheck className="w-12 h-12 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">TAXA CONFORMIDADE</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.taxaConformidade}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">SPRINTS CRÍTICAS</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.criticos}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">ÚLTIMA AUDITORIA</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    {kpis.ultimaAuditoria !== "N/A"
                      ? new Date(kpis.ultimaAuditoria).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Auditorias</CardTitle>
              <div className="flex gap-3">
                <Select value={filtroProj} onValueChange={setFiltroProj}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Projetos</SelectItem>
                    {projetos.map((proj) => (
                      <SelectItem key={proj} value={proj}>
                        {proj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Aprovado com Ressalvas">Aprovado com Ressalvas</SelectItem>
                    <SelectItem value="Reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {auditoriasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma auditoria encontrada</p>
                <p className="text-gray-400 text-sm mt-2">
                  Clique em "Nova Auditoria" para começar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditoriasFiltradas
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((aud) => {
                    const Icon =
                      aud.status === "Aprovado"
                        ? CheckCircle2
                        : aud.status === "Aprovado com Ressalvas"
                        ? AlertTriangle
                        : XCircle;
                    const iconColor =
                      aud.status === "Aprovado"
                        ? "text-green-600"
                        : aud.status === "Aprovado com Ressalvas"
                        ? "text-yellow-600"
                        : "text-red-600";

                    const itensAtendidos = CRITERIOS_KEYS.filter((key) => aud.checklist[key]).length;

                    return (
                      <Card
                        key={aud.id}
                        className="border hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <Icon className={`w-8 h-8 ${iconColor}`} />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {aud.projeto} - {aud.sprint}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(aud.data).toLocaleDateString("pt-BR")} • {aud.auditor}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-3xl font-bold text-blue-600">{aud.scoreTotal}%</p>
                                <p className="text-xs text-gray-500">
                                  {itensAtendidos}/15 critérios
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Badge
                                  className={
                                    aud.status === "Aprovado"
                                      ? "bg-green-500 text-white"
                                      : aud.status === "Aprovado com Ressalvas"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-red-500 text-white"
                                  }
                                >
                                  {aud.status}
                                </Badge>
                                {aud.duracao && aud.duracao > 15 && (
                                  <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Sprint &gt;15 dias
                                  </Badge>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedAuditoria(aud)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 hover:bg-blue-50"
                                  onClick={() => handleEditarAuditoria(aud)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleExcluirAuditoria(aud.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Formulário */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditandoAuditoria(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editandoAuditoria ? `Editar Auditoria - ${editandoAuditoria.projeto} ${editandoAuditoria.sprint}` : "Nova Auditoria de Sprint"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto <span className="text-red-500">*</span>
                </label>
                <Select value={formData.projeto} onValueChange={(val) => setFormData({ ...formData, projeto: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos.map((proj) => (
                      <SelectItem key={proj} value={proj}>
                        {proj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprint <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Sprint 1, Sprint 2..."
                  value={formData.sprint}
                  onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início Sprint</label>
                <Input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => {
                    const novaDataInicio = e.target.value;
                    const duracao = formData.dataFim && novaDataInicio
                      ? Math.ceil((new Date(formData.dataFim).getTime() - new Date(novaDataInicio).getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    setFormData({ ...formData, dataInicio: novaDataInicio, duracao });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim Sprint</label>
                <Input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => {
                    const novaDataFim = e.target.value;
                    const duracao = formData.dataInicio && novaDataFim
                      ? Math.ceil((new Date(novaDataFim).getTime() - new Date(formData.dataInicio).getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    setFormData({ ...formData, dataFim: novaDataFim, duracao });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duração (dias)</label>
                <Input
                  type="number"
                  value={formData.duracao}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Calculado automaticamente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Auditoria</label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auditor <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nome do auditor"
                  value={formData.auditor}
                  onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
                />
              </div>
            </div>

            {/* Checklist Maker Compass */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Checklist Maker Compass
              </h3>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Score Total Calculado:</p>
                    <p className="text-4xl font-bold text-blue-600 mt-1">{scoreAtual}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {itensAtendidos}/15 critérios atendidos
                    </p>
                  </div>
                  <Badge
                    className={
                      statusAtual === "Aprovado"
                        ? "bg-green-500 text-white text-lg px-4 py-2"
                        : statusAtual === "Aprovado com Ressalvas"
                        ? "bg-yellow-500 text-white text-lg px-4 py-2"
                        : "bg-red-500 text-white text-lg px-4 py-2"
                    }
                  >
                    {statusAtual}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-4 bg-white">
                {CRITERIOS_KEYS.map((key, index) => (
                  <div key={key} className="flex items-start gap-3 p-3 hover:bg-blue-50 rounded transition-colors">
                    <Checkbox
                      id={key}
                      checked={formData.checklist[key]}
                      onCheckedChange={(checked) => handleChecklistChange(key, checked as boolean)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={key}
                      className="text-sm text-gray-700 cursor-pointer flex-1 leading-relaxed"
                    >
                      <span className="font-medium text-blue-600 mr-2">{index + 1}.</span>
                      {CRITERIOS_LABELS[index]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Gerais
              </label>
              <Textarea
                placeholder="Descreva pontos importantes observados durante a sprint..."
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
              />
            </div>

            {/* Ações Corretivas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ações Corretivas
              </label>
              <Textarea
                placeholder="Liste ações necessárias para melhorar a conformidade..."
                value={formData.acoesCorretivas}
                onChange={(e) => setFormData({ ...formData, acoesCorretivas: e.target.value })}
                rows={4}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSalvarAuditoria}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Salvar Auditoria
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={!!selectedAuditoria} onOpenChange={() => setSelectedAuditoria(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes da Auditoria</DialogTitle>
          </DialogHeader>

          {selectedAuditoria && (
            <div className="space-y-6 py-4">
              {/* Informações Gerais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Projeto</p>
                  <p className="font-semibold text-gray-900">{selectedAuditoria.projeto}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sprint</p>
                  <p className="font-semibold text-gray-900">{selectedAuditoria.sprint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Início Sprint</p>
                  <p className="font-semibold text-gray-900">
                    {selectedAuditoria.dataInicio ? new Date(selectedAuditoria.dataInicio).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Fim Sprint</p>
                  <p className="font-semibold text-gray-900">
                    {selectedAuditoria.dataFim ? new Date(selectedAuditoria.dataFim).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duração</p>
                  <p className="font-semibold text-gray-900">{selectedAuditoria.duracao} dias</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Auditoria</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedAuditoria.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auditor</p>
                  <p className="font-semibold text-gray-900">{selectedAuditoria.auditor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={
                      selectedAuditoria.status === "Aprovado"
                        ? "bg-green-500 text-white"
                        : selectedAuditoria.status === "Aprovado com Ressalvas"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {selectedAuditoria.status}
                  </Badge>
                </div>
              </div>

              {/* Score Total */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Score Total</p>
                <p className="text-5xl font-bold text-blue-600">{selectedAuditoria.scoreTotal}%</p>
                <p className="text-sm text-gray-500 mt-2">
                  {CRITERIOS_KEYS.filter((key) => selectedAuditoria.checklist[key]).length}/15 critérios atendidos
                </p>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critérios Avaliados</h3>
                <div className="space-y-2 border rounded-lg p-4 bg-white">
                  {CRITERIOS_KEYS.map((key, index) => {
                    const atendido = selectedAuditoria.checklist[key];
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded ${
                          atendido ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        {atendido ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700">
                          <span className="font-medium mr-2">{index + 1}.</span>
                          {CRITERIOS_LABELS[index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observações */}
              {selectedAuditoria.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Observações</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedAuditoria.observacoes}
                  </p>
                </div>
              )}

              {/* Ações Corretivas */}
              {selectedAuditoria.acoesCorretivas && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ações Corretivas</h3>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg whitespace-pre-wrap border-l-4 border-yellow-500">
                    {selectedAuditoria.acoesCorretivas}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
