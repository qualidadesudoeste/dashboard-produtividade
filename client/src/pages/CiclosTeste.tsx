import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, AlertCircle, CheckCircle, Clock, FileText, X, Calendar, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CicloTeste {
  cliente: string;
  projeto: string;
  sprint: string;
  inicio: string;
  fim: string;
  duracao: number;
  ciclo1: string;
  ciclo2: string;
  ciclo3: string;
  status: string;
  correcoes_horas: number;
  correcoes_cards: number;
  total_horas: number;
  total_cards: number;
  tempo_previsto: number;
  retrabalho: number;
}

export default function CiclosTeste() {
  const [ciclos, setCiclos] = useState<CicloTeste[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [selectedCiclo, setSelectedCiclo] = useState<CicloTeste | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/ciclos_teste.json")
      .then((res) => res.json())
      .then((data) => {
        setCiclos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Função auxiliar para converter DD/MM/YYYY para Date
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Filtros
  const ciclosFiltrados = ciclos.filter((ciclo) => {
    const matchCliente = filtroCliente === "Todos" || ciclo.cliente === filtroCliente;
    const matchStatus = filtroStatus === "Todos" || ciclo.status === filtroStatus;
    
    // Filtro de data
    let matchData = true;
    if (dataInicio || dataFim) {
      const cicloInicio = parseDate(ciclo.inicio);
      const cicloFim = parseDate(ciclo.fim);
      
      if (dataInicio) {
        const filtroInicio = new Date(dataInicio);
        matchData = matchData && cicloFim >= filtroInicio;
      }
      
      if (dataFim) {
        const filtroFim = new Date(dataFim);
        matchData = matchData && cicloInicio <= filtroFim;
      }
    }
    
    return matchCliente && matchStatus && matchData;
  });

  const clientes = ["Todos", ...Array.from(new Set(ciclos.map((c) => c.cliente)))];
  const statusList = ["Todos", ...Array.from(new Set(ciclos.map((c) => c.status)))];

  // Métricas
  const totalCiclos = ciclosFiltrados.length;
  const totalHoras = ciclosFiltrados.reduce((sum, c) => sum + c.total_horas, 0);
  const totalCards = ciclosFiltrados.reduce((sum, c) => sum + c.total_cards, 0);
  const retrabalhoMedio = ciclosFiltrados.length > 0
    ? ciclosFiltrados.reduce((sum, c) => sum + c.retrabalho, 0) / ciclosFiltrados.length
    : 0;
  
  const liberados = ciclosFiltrados.filter((c) => c.status === "Liberada").length;
  const emCorrecao = ciclosFiltrados.filter((c) => c.status === "Correção/Atrasada").length;
  const liberadosAtrasados = ciclosFiltrados.filter((c) => c.status === "Liberada/Atrasada").length;
  const liberadosSemTeste = ciclosFiltrados.filter((c) => c.status === "Liberada/Sem teste").length;

  // Dados para gráficos
  const statusData = [
    { name: "Liberada", value: liberados, color: "#10b981" },
    { name: "Correção/Atrasada", value: emCorrecao, color: "#ef4444" },
    { name: "Liberada/Atrasada", value: liberadosAtrasados, color: "#f59e0b" },
    { name: "Liberada/Sem teste", value: liberadosSemTeste, color: "#eab308" },
  ].filter((item) => item.value > 0);

  const retrabalhoData = ciclosFiltrados
    .sort((a, b) => b.retrabalho - a.retrabalho)
    .slice(0, 10)
    .map((c) => ({
      name: `${c.cliente} - ${c.projeto}`,
      retrabalho: c.retrabalho,
    }));

  const duracaoData = ciclosFiltrados
    .sort((a, b) => b.duracao - a.duracao)
    .slice(0, 10)
    .map((c) => ({
      name: `${c.cliente} - ${c.projeto}`,
      duracao: c.duracao,
    }));

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      "Liberada": { bg: "bg-green-500/20", text: "text-green-400", icon: CheckCircle },
      "Correção/Atrasada": { bg: "bg-red-500/20", text: "text-red-400", icon: AlertCircle },
      "Liberada/Atrasada": { bg: "bg-orange-500/20", text: "text-orange-400", icon: Clock },
      "Liberada/Sem teste": { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: FileText },
    };
    const badge = badges[status] || { bg: "bg-gray-500/20", text: "text-muted-foreground", icon: Activity };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-background data-grid">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
          Ciclos de Teste
        </h1>
        <p className="text-muted-foreground"></p>
      </div>

      {/* Filtros */}
      <div className="space-y-4 mb-8">
        {/* Filtros Cliente e Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hover-lift">
          <label className="block text-sm font-medium text-foreground mb-2">Cliente</label>
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
          >
            {clientes.map((cliente) => (
              <option key={cliente} value={cliente}>
                {cliente}
              </option>
            ))}
          </select>
        </div>

        <div className="hover-lift">
          <label className="block text-sm font-medium text-foreground mb-2">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
          >
            {statusList.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        </div>

        {/* Filtros de Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="hover-lift">
            <label className="block text-sm font-medium text-foreground mb-2">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
            />
          </div>

          <div className="hover-lift">
            <label className="block text-sm font-medium text-foreground mb-2">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Filtros Rápidos</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const hoje = new Date();
                  const seteDiasAtras = new Date(hoje);
                  seteDiasAtras.setDate(hoje.getDate() - 7);
                  setDataInicio(seteDiasAtras.toISOString().split('T')[0]);
                  setDataFim(hoje.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => {
                  const hoje = new Date();
                  const trintaDiasAtras = new Date(hoje);
                  trintaDiasAtras.setDate(hoje.getDate() - 30);
                  setDataInicio(trintaDiasAtras.toISOString().split('T')[0]);
                  setDataFim(hoje.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
              >
                Últimos 30 dias
              </button>
              <button
                onClick={() => {
                  setDataInicio("");
                  setDataFim("");
                }}
                className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Total de Ciclos</h3>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{totalCiclos}</p>
          <p className="text-sm text-muted-foreground">Projetos em teste</p>
        </div>

        <div className="bg-white backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Total de Horas</h3>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{totalHoras.toFixed(1)}<span className="text-xl text-muted-foreground ml-1">h</span></p>
          <p className="text-sm text-muted-foreground">Tempo total investido</p>
        </div>

        <div className="bg-white backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Total de Cards</h3>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{totalCards}</p>
          <p className="text-sm text-muted-foreground">Atividades testadas</p>
        </div>

        <div className="bg-white backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Retrabalho Médio</h3>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{retrabalhoMedio.toFixed(1)}<span className="text-xl text-muted-foreground ml-1">%</span></p>
          <p className="text-sm text-muted-foreground">Taxa de correções</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição por Status */}
        <div className="bg-white backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 hover-lift hover-border-glow">
          <h3 className="text-xl font-semibold text-foreground mb-6">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  border: "1px solid rgba(75, 85, 99, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Retrabalho */}
        <div className="bg-white backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 hover-lift hover-border-glow">
          <h3 className="text-xl font-semibold text-foreground mb-6">Top 10 - Maior Retrabalho</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retrabalhoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" style={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  border: "1px solid rgba(75, 85, 99, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="retrabalho" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Duração */}
      <div className="bg-white backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 mb-8 hover-lift hover-border-glow">
        <h3 className="text-xl font-semibold text-foreground mb-6">Top 10 - Maior Duração</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={duracaoData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} style={{ fontSize: "11px" }} />
            <YAxis stroke="#9ca3af" label={{ value: "Dias", angle: -90, position: "insideLeft", style: { fill: "#9ca3af" } }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                border: "1px solid rgba(75, 85, 99, 0.5)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => `${value} dias`}
            />
            <Bar dataKey="duracao" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de Ciclos */}
      <div className="bg-white backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 hover-lift hover-border-glow">
        <h3 className="text-xl font-semibold text-foreground mb-6">Detalhamento dos Ciclos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Projeto</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Sprint</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Duração</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Horas</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Cards</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Retrabalho</th>
              </tr>
            </thead>
            <tbody>
              {ciclosFiltrados.map((ciclo, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-200/50 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCiclo(ciclo);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="py-3 px-4 text-foreground font-medium">{ciclo.cliente}</td>
                  <td className="py-3 px-4 text-foreground">{ciclo.projeto}</td>
                  <td className="py-3 px-4 text-muted-foreground">{ciclo.sprint}</td>
                  <td className="py-3 px-4 text-center text-foreground">{ciclo.duracao} dias</td>
                  <td className="py-3 px-4">{getStatusBadge(ciclo.status)}</td>
                  <td className="py-3 px-4 text-right text-foreground">{ciclo.total_horas.toFixed(1)}h</td>
                  <td className="py-3 px-4 text-right text-foreground">{ciclo.total_cards}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${ciclo.retrabalho > 20 ? "text-red-400" : ciclo.retrabalho > 10 ? "text-orange-400" : "text-green-400"}`}>
                      {ciclo.retrabalho.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCiclo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {selectedCiclo.projeto}
                </DialogTitle>
                <p className="text-muted-foreground mt-2">{selectedCiclo.cliente} - {selectedCiclo.sprint}</p>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Informações Gerais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-muted-foreground">Duração</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedCiclo.duracao}</p>
                    <p className="text-xs text-muted-foreground">dias</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-muted-foreground">Total Horas</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedCiclo.total_horas.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">horas</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-muted-foreground">Total Cards</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedCiclo.total_cards}</p>
                    <p className="text-xs text-muted-foreground">cards</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <p className="text-xs text-muted-foreground">Retrabalho</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedCiclo.retrabalho.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">do total</p>
                  </div>
                </div>

                {/* Período */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Período de Execução
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Início</p>
                      <p className="text-sm font-medium text-foreground">{selectedCiclo.inicio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fim</p>
                      <p className="text-sm font-medium text-foreground">{selectedCiclo.fim}</p>
                    </div>
                  </div>
                </div>

                {/* Ciclos de Teste */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Ciclos de Teste
                  </h4>
                  <div className="space-y-3">
                    {selectedCiclo.ciclo1 && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Primeiro Ciclo</p>
                          <p className="text-sm font-medium text-foreground">{selectedCiclo.ciclo1}</p>
                        </div>
                      </div>
                    )}
                    {selectedCiclo.ciclo2 && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">2</div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Segundo Ciclo</p>
                          <p className="text-sm font-medium text-foreground">{selectedCiclo.ciclo2}</p>
                        </div>
                      </div>
                    )}
                    {selectedCiclo.ciclo3 && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Terceiro Ciclo</p>
                          <p className="text-sm font-medium text-foreground">{selectedCiclo.ciclo3}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Correções */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Correções e Retrabalho
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-muted-foreground mb-1">Horas de Correção</p>
                      <p className="text-xl font-bold text-foreground">{selectedCiclo.correcoes_horas.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground mt-1">de {selectedCiclo.total_horas.toFixed(1)}h totais</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-muted-foreground mb-1">Cards Corrigidos</p>
                      <p className="text-xl font-bold text-foreground">{selectedCiclo.correcoes_cards}</p>
                      <p className="text-xs text-muted-foreground mt-1">de {selectedCiclo.total_cards} cards totais</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Status Atual</h4>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedCiclo.status)}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
