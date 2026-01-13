/**
 * Página de Auditoria Funcional
 * - Realizar auditorias de projetos
 * - Visualizar histórico de auditorias
 * - Gerenciar status de qualidade
 */

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  Trash2,
  FileCheck,
  BarChart3,
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

interface Auditoria {
  id: string;
  projeto: string;
  data: string;
  auditor: string;
  criterios: {
    documentacao: number;
    codigo: number;
    testes: number;
    requisitos: number;
    desempenho: number;
    seguranca: number;
  };
  scoreTotal: number;
  status: "Aprovado" | "Aprovado com Ressalvas" | "Reprovado";
  observacoes: string;
  acoesCorretivas: string;
}

export default function Auditoria() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAuditoria, setSelectedAuditoria] = useState<Auditoria | null>(null);
  const [filtroProj, setFiltroProj] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Form state
  const [formData, setFormData] = useState({
    projeto: "",
    data: new Date().toISOString().split("T")[0],
    auditor: "",
    documentacao: 0,
    codigo: 0,
    testes: 0,
    requisitos: 0,
    desempenho: 0,
    seguranca: 0,
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
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      });

    // Carregar auditorias do localStorage
    const saved = localStorage.getItem("auditorias");
    if (saved) {
      setAuditorias(JSON.parse(saved));
    }
  }, []);

  const projetos = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.Projeto))).sort();
  }, [data]);

  const calcularScore = () => {
    const { documentacao, codigo, testes, requisitos, desempenho, seguranca } = formData;
    return (documentacao + codigo + testes + requisitos + desempenho + seguranca) / 6;
  };

  const determinarStatus = (score: number): "Aprovado" | "Aprovado com Ressalvas" | "Reprovado" => {
    if (score >= 80) return "Aprovado";
    if (score >= 60) return "Aprovado com Ressalvas";
    return "Reprovado";
  };

  const salvarAuditoria = () => {
    if (!formData.projeto || !formData.auditor) {
      alert("Preencha projeto e auditor!");
      return;
    }

    const scoreTotal = calcularScore();
    const status = determinarStatus(scoreTotal);

    const novaAuditoria: Auditoria = {
      id: Date.now().toString(),
      projeto: formData.projeto,
      data: formData.data,
      auditor: formData.auditor,
      criterios: {
        documentacao: formData.documentacao,
        codigo: formData.codigo,
        testes: formData.testes,
        requisitos: formData.requisitos,
        desempenho: formData.desempenho,
        seguranca: formData.seguranca,
      },
      scoreTotal,
      status,
      observacoes: formData.observacoes,
      acoesCorretivas: formData.acoesCorretivas,
    };

    const novasAuditorias = [...auditorias, novaAuditoria];
    setAuditorias(novasAuditorias);
    localStorage.setItem("auditorias", JSON.stringify(novasAuditorias));

    // Reset form
    setFormData({
      projeto: "",
      data: new Date().toISOString().split("T")[0],
      auditor: "",
      documentacao: 0,
      codigo: 0,
      testes: 0,
      requisitos: 0,
      desempenho: 0,
      seguranca: 0,
      observacoes: "",
      acoesCorretivas: "",
    });
    setIsFormOpen(false);
  };

  const excluirAuditoria = (id: string) => {
    if (!confirm("Deseja realmente excluir esta auditoria?")) return;
    const novasAuditorias = auditorias.filter((a) => a.id !== id);
    setAuditorias(novasAuditorias);
    localStorage.setItem("auditorias", JSON.stringify(novasAuditorias));
  };

  const auditoriasFiltradas = auditorias.filter((a) => {
    const matchProj = filtroProj === "todos" || a.projeto === filtroProj;
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    return matchProj && matchStatus;
  });

  // KPIs
  const totalAuditorias = auditorias.length;
  const aprovadas = auditorias.filter((a) => a.status === "Aprovado").length;
  const taxaConformidade = totalAuditorias > 0 ? (aprovadas / totalAuditorias) * 100 : 0;
  const projetosCriticos = auditorias.filter((a) => a.scoreTotal < 60).length;
  const ultimaAuditoria = auditorias.length > 0 
    ? auditorias.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0].data
    : "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovado":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Aprovado</Badge>;
      case "Aprovado com Ressalvas":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Com Ressalvas</Badge>;
      case "Reprovado":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Reprovado</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Aprovado":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "Aprovado com Ressalvas":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "Reprovado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header com KPIs */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auditoria de Projetos</h1>
            <p className="text-gray-600 mt-1">Realize e gerencie auditorias de qualidade</p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-lg border-l-4 border-l-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase">Total Auditorias</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalAuditorias}</p>
                </div>
                <FileCheck className="h-10 w-10 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase">Taxa Conformidade</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{taxaConformidade.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-red-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase">Projetos Críticos</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{projetosCriticos}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase">Última Auditoria</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-1">
                    {ultimaAuditoria !== "N/A" ? new Date(ultimaAuditoria).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de Nova Auditoria */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Nova Auditoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Projeto *</label>
                  <Select value={formData.projeto} onValueChange={(v) => setFormData({ ...formData, projeto: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Data</label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Auditor *</label>
                <Input
                  type="text"
                  placeholder="Nome do auditor"
                  value={formData.auditor}
                  onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Critérios de Avaliação (0-100)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "documentacao", label: "Documentação Completa" },
                    { key: "codigo", label: "Qualidade do Código" },
                    { key: "testes", label: "Testes Implementados" },
                    { key: "requisitos", label: "Conformidade com Requisitos" },
                    { key: "desempenho", label: "Desempenho" },
                    { key: "seguranca", label: "Segurança" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{label}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) || 0 })}
                        className="font-bold text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-bold text-gray-700">Score Total Calculado:</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">{calcularScore().toFixed(1)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className="font-bold">{determinarStatus(calcularScore())}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Observações Gerais</label>
                <Textarea
                  placeholder="Descreva pontos importantes observados durante a auditoria..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ações Corretivas</label>
                <Textarea
                  placeholder="Liste ações necessárias para melhorar a qualidade..."
                  value={formData.acoesCorretivas}
                  onChange={(e) => setFormData({ ...formData, acoesCorretivas: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={salvarAuditoria} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Salvar Auditoria
                </Button>
                <Button onClick={() => setIsFormOpen(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filtros e Lista */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Histórico de Auditorias</CardTitle>
              <div className="flex gap-3">
                <Select value={filtroProj} onValueChange={setFiltroProj}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Projetos</SelectItem>
                    {projetos.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Aprovado com Ressalvas">Com Ressalvas</SelectItem>
                    <SelectItem value="Reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {auditoriasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-semibold">Nenhuma auditoria encontrada</p>
                <p className="text-gray-400 text-sm mt-2">Clique em "Nova Auditoria" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditoriasFiltradas
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((auditoria) => (
                    <div
                      key={auditoria.id}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(auditoria.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{auditoria.projeto}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(auditoria.data).toLocaleDateString("pt-BR")} • {auditoria.auditor}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-blue-600">{auditoria.scoreTotal.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                      <div>
                        {getStatusBadge(auditoria.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAuditoria(auditoria)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => excluirAuditoria(auditoria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        <Dialog open={!!selectedAuditoria} onOpenChange={() => setSelectedAuditoria(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Detalhes da Auditoria</DialogTitle>
            </DialogHeader>
            {selectedAuditoria && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-600">Projeto</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuditoria.projeto}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">Data</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedAuditoria.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">Auditor</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuditoria.auditor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedAuditoria.status)}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-bold text-gray-700">Score Total</p>
                  <p className="text-5xl font-extrabold text-blue-600 mt-2">
                    {selectedAuditoria.scoreTotal.toFixed(1)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Critérios Avaliados</p>
                  <div className="space-y-2">
                    {Object.entries(selectedAuditoria.criterios).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        documentacao: "Documentação",
                        codigo: "Código",
                        testes: "Testes",
                        requisitos: "Requisitos",
                        desempenho: "Desempenho",
                        seguranca: "Segurança",
                      };
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-gray-700 w-32">{labels[key]}</p>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all"
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                          <p className="text-sm font-bold text-blue-600 w-12 text-right">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedAuditoria.observacoes && (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Observações</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedAuditoria.observacoes}
                    </p>
                  </div>
                )}

                {selectedAuditoria.acoesCorretivas && (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Ações Corretivas</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedAuditoria.acoesCorretivas}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
