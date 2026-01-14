import { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Activity, AlertCircle, CheckCircle, Clock, FileText, X, Calendar, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getGerentePorCliente } from "@/lib/gerenteUtils";

interface CicloTeste {
  gerente: string;
  cliente: string;
  projeto: string;
  sprint: string;
  inicio: string;
  fim: string;
  duracao: number;
  ciclo1?: string;
  ciclo2?: string;
  ciclo3?: string;
  ciclo4?: string;
  ciclo5?: string;
  [key: `ciclo${number}`]: string | undefined;
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
  const [filtroProjeto, setFiltroProjeto] = useState("Todos");
  const [filtroGerente, setFiltroGerente] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [selectedCiclo, setSelectedCiclo] = useState<CicloTeste | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroRankingRetrabalho, setFiltroRankingRetrabalho] = useState("");
  const [filtroRankingDuracao, setFiltroRankingDuracao] = useState("");

  useEffect(() => {
    fetch("/ciclos_teste.json")
      .then((res) => res.json())
      .then((data) => {
        // Aplicar gerente dinamicamente baseado no mapeamento configurado
        const ciclosComGerente = data.map((ciclo: CicloTeste) => ({
          ...ciclo,
          gerente: getGerentePorCliente(ciclo.cliente)
        }));
        setCiclos(ciclosComGerente);
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
    const matchProjeto = filtroProjeto === "Todos" || ciclo.projeto === filtroProjeto;
    const matchGerente = filtroGerente === "Todos" || ciclo.gerente === filtroGerente;
    const matchStatus = filtroStatus === "Todos" || ciclo.status === filtroStatus;
    
    // Filtro de data (considerando datas dos ciclos)
    let matchData = true;
    if (dataInicio || dataFim) {
      const datasCiclos: Date[] = [];
      
      // Coletar todas as datas de ciclos que não são vazias
      if (ciclo.ciclo1 && ciclo.ciclo1 !== "-") datasCiclos.push(parseDate(ciclo.ciclo1));
      if (ciclo.ciclo2 && ciclo.ciclo2 !== "-") datasCiclos.push(parseDate(ciclo.ciclo2));
      if (ciclo.ciclo3 && ciclo.ciclo3 !== "-") datasCiclos.push(parseDate(ciclo.ciclo3));
      
      if (datasCiclos.length > 0) {
        const menorData = new Date(Math.min(...datasCiclos.map(d => d.getTime())));
        const maiorData = new Date(Math.max(...datasCiclos.map(d => d.getTime())));
        
        if (dataInicio) {
          const filtroInicio = new Date(dataInicio);
          matchData = matchData && maiorData >= filtroInicio;
        }
        
        if (dataFim) {
          const filtroFim = new Date(dataFim);
          matchData = matchData && menorData <= filtroFim;
        }
      } else {
        // Se não há ciclos, usar datas de início/fim da sprint
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
    }
    
    return matchCliente && matchProjeto && matchGerente && matchStatus && matchData;
  });

  const clientes = ["Todos", ...Array.from(new Set(ciclos.map((c) => c.cliente)))];
  const projetos = ["Todos", ...Array.from(new Set(ciclos.map((c) => c.projeto)))];
  const gerentes = ["Todos", ...Array.from(new Set(ciclos.map((c) => c.gerente)))];
  const statusList = ["Todos", ...Array.from(new Set(ciclos.map((c) => c.status)))];

  // Calcular número máximo de ciclos dinamicamente
  const maxCiclos = Math.max(
    ...ciclos.map((ciclo) => {
      let count = 0;
      for (let i = 1; i <= 10; i++) { // Verificar até 10 ciclos
        const key = `ciclo${i}` as keyof CicloTeste;
        if (ciclo[key] && ciclo[key] !== "-") count = i;
      }
      return count;
    }),
    3 // Mínimo de 3 ciclos
  );

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

  // Rankings completos (todos os projetos)
  // Agrupar por projeto e calcular média de retrabalho
  const retrabalhosPorProjeto = ciclosFiltrados.reduce((acc, ciclo) => {
    const chave = `${ciclo.cliente}|${ciclo.projeto}`;
    if (!acc[chave]) {
      acc[chave] = {
        cliente: ciclo.cliente,
        projeto: ciclo.projeto,
        retrabalhos: [],
      };
    }
    acc[chave].retrabalhos.push(ciclo.retrabalho);
    return acc;
  }, {} as Record<string, { cliente: string; projeto: string; retrabalhos: number[] }>);

  const retrabalhoRankingCompleto = Object.values(retrabalhosPorProjeto)
    .map((item) => ({
      cliente: item.cliente,
      projeto: item.projeto,
      retrabalho: item.retrabalhos.reduce((sum, r) => sum + r, 0) / item.retrabalhos.length,
      numSprints: item.retrabalhos.length,
    }))
    .sort((a, b) => b.retrabalho - a.retrabalho)
    .map((item, index) => ({
      posicao: index + 1,
      ...item,
    }));

  const retrabalhoRanking = retrabalhoRankingCompleto.filter((item) => {
    const busca = filtroRankingRetrabalho.toLowerCase();
    return (
      item.cliente.toLowerCase().includes(busca) ||
      item.projeto.toLowerCase().includes(busca)
    );
  });

  const duracaoRankingCompleto = ciclosFiltrados
    .sort((a, b) => b.duracao - a.duracao)
    .map((c, index) => ({
      posicao: index + 1,
      cliente: c.cliente,
      projeto: c.projeto,
      sprint: c.sprint,
      duracao: c.duracao,
    }));

  const duracaoRanking = duracaoRankingCompleto.filter((item) => {
    const busca = filtroRankingDuracao.toLowerCase();
    return (
      item.cliente.toLowerCase().includes(busca) ||
      item.projeto.toLowerCase().includes(busca)
    );
  });

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
    <div className="min-h-screen p-6 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
          
        </h1>
        <p className="text-muted-foreground"></p>
      </div>

      {/* Filtros */}
      <div className="space-y-4 mb-8">
        {/* Filtros Cliente, Projeto, Gerente e Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hover-lift">
          <label className="block text-sm font-medium text-foreground mb-2">Cliente</label>
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all [&>option]:bg-slate-800 [&>option]:text-white"
          >
            {clientes.map((cliente) => (
              <option key={cliente} value={cliente}>
                {cliente}
              </option>
            ))}
          </select>
        </div>

        <div className="hover-lift">
          <label className="block text-sm font-medium text-foreground mb-2">Projeto</label>
          <select
            value={filtroProjeto}
            onChange={(e) => setFiltroProjeto(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all [&>option]:bg-slate-800 [&>option]:text-white"
          >
            {projetos.map((projeto) => (
              <option key={projeto} value={projeto}>
                {projeto}
              </option>
            ))}
          </select>
        </div>

        <div className="hover-lift">
          <label className="block text-sm font-medium text-foreground mb-2">Gerente</label>
          <select
            value={filtroGerente}
            onChange={(e) => setFiltroGerente(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all [&>option]:bg-slate-800 [&>option]:text-white"
          >
            {gerentes.map((gerente) => (
              <option key={gerente} value={gerente}>
                {gerente}
              </option>
            ))}
          </select>
        </div>

        <div className="hover-lift">
          <label className="block text-sm font-medium text-foreground mb-2">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all [&>option]:bg-slate-800 [&>option]:text-white"
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
              className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
            />
          </div>

          <div className="hover-lift">
            <label className="block text-sm font-medium text-foreground mb-2">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
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
        <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Total de Ciclos</h3>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{totalCiclos}</p>
          <p className="text-sm text-muted-foreground">Projetos em teste</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Total de Horas</h3>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{totalHoras.toFixed(1)}<span className="text-xl text-muted-foreground ml-1">h</span></p>
          <p className="text-sm text-muted-foreground">Tempo total investido</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">Total de Cards</h3>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">{totalCards}</p>
          <p className="text-sm text-muted-foreground">Atividades testadas</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-orange-500/30 rounded-xl p-6 hover-lift hover-glow">
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
        <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 hover-lift hover-border-glow">
          <h3 className="text-xl font-semibold text-foreground mb-6">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.value}
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
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{
                  color: "#e5e7eb",
                }}
              />
              <Legend
                wrapperStyle={{
                  color: "#e5e7eb",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking Retrabalho */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 hover-lift hover-border-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Ranking Retrabalho</h3>
            <input
              type="text"
              placeholder="Buscar cliente ou projeto..."
              value={filtroRankingRetrabalho}
              onChange={(e) => setFiltroRankingRetrabalho(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                <tr className="border-b border-blue-500/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Projeto</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Retrabalho</th>
                </tr>
              </thead>
              <tbody>
                {retrabalhoRanking.map((item, idx) => (
                  <tr 
                    key={idx}
                    className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        item.posicao === 1 ? "bg-yellow-500/20 text-yellow-400" :
                        item.posicao === 2 ? "bg-gray-400/20 text-gray-300" :
                        item.posicao === 3 ? "bg-orange-600/20 text-orange-400" :
                        "bg-slate-700/50 text-gray-400"
                      }`}>
                        {item.posicao}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">{item.cliente}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">{item.projeto}</span>
                        {item.numSprints > 1 && (
                          <span className="text-xs text-gray-400">Média de {item.numSprints} sprints</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-orange-400 font-bold">{item.retrabalho.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ranking Duração */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 mb-8 hover-lift hover-border-glow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Ranking Duração</h3>
          <input
            type="text"
            placeholder="Buscar cliente ou projeto..."
            value={filtroRankingDuracao}
            onChange={(e) => setFiltroRankingDuracao(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
              <tr className="border-b border-blue-500/30">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Projeto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Sprint</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Duração</th>
              </tr>
            </thead>
            <tbody>
              {duracaoRanking.map((item, idx) => (
                <tr 
                  key={idx}
                  className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      item.posicao === 1 ? "bg-yellow-500/20 text-yellow-400" :
                      item.posicao === 2 ? "bg-gray-400/20 text-gray-300" :
                      item.posicao === 3 ? "bg-orange-600/20 text-orange-400" :
                      "bg-slate-700/50 text-gray-400"
                    }`}>
                      {item.posicao}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">{item.cliente}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{item.projeto}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{item.sprint}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-400 font-bold">{item.duracao} dias</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Ciclos */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 hover-lift hover-border-glow shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6">Detalhamento dos Ciclos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-500/20">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Gerente</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Projeto</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sprint</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Início</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Fim</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Duração</th>
                {Array.from({ length: maxCiclos }, (_, i) => (
                  <th key={`ciclo-header-${i + 1}`} className="text-center py-3 px-4 text-gray-300 font-medium">
                    {i + 1}º Ciclo
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Correções<br/>(horas)</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Correções<br/>(cards)</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Total<br/>(horas)</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Total<br/>(cards)</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Tempo<br/>Previsto</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Retrabalho<br/>(tempo)</th>
              </tr>
            </thead>
            <tbody>
              {ciclosFiltrados.map((ciclo, index) => (
                <tr 
                  key={index} 
                  className="border-b border-blue-500/20 hover:bg-blue-900/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCiclo(ciclo);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="py-3 px-4 text-white font-medium">{ciclo.gerente}</td>
                  <td className="py-3 px-4 text-white font-medium">{ciclo.cliente}</td>
                  <td className="py-3 px-4 text-white">{ciclo.projeto}</td>
                  <td className="py-3 px-4 text-gray-300">{ciclo.sprint}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{ciclo.inicio}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{ciclo.fim}</td>
                  <td className="py-3 px-4 text-center text-white">{ciclo.duracao}</td>
                  {Array.from({ length: maxCiclos }, (_, i) => {
                    const cicloKey = `ciclo${i + 1}` as keyof CicloTeste;
                    const cicloValue = ciclo[cicloKey];
                    return (
                      <td key={`ciclo-${index}-${i + 1}`} className="py-3 px-4 text-center text-gray-300">
                        {cicloValue && cicloValue !== "-" ? cicloValue : "-"}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4">{getStatusBadge(ciclo.status)}</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.correcoes_horas > 0 ? ciclo.correcoes_horas.toFixed(2) : '-'}</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.correcoes_cards > 0 ? ciclo.correcoes_cards : '-'}</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.total_horas.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.total_cards}</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.tempo_previsto > 0 ? ciclo.tempo_previsto.toFixed(2) : '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${ciclo.retrabalho > 20 ? "text-red-400" : ciclo.retrabalho > 10 ? "text-orange-400" : "text-green-400"}`}>
                      {ciclo.retrabalho.toFixed(2)}%
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
                <p className="text-gray-400 mt-2">{selectedCiclo.cliente} - {selectedCiclo.sprint}</p>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Informações Gerais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-gray-400">Duração</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedCiclo.duracao}</p>
                    <p className="text-xs text-gray-400">dias</p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-gray-400">Total Horas</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedCiclo.total_horas.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">horas</p>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-gray-400">Total Cards</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedCiclo.total_cards}</p>
                    <p className="text-xs text-gray-400">cards</p>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <p className="text-xs text-gray-400">Retrabalho</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedCiclo.retrabalho.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">do total</p>
                  </div>
                </div>

                {/* Período */}
                <div className="bg-slate-900/50 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Período de Execução
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Início</p>
                      <p className="text-sm font-medium text-white">{selectedCiclo.inicio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Fim</p>
                      <p className="text-sm font-medium text-white">{selectedCiclo.fim}</p>
                    </div>
                  </div>
                </div>

                {/* Ciclos de Teste */}
                <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Ciclos de Teste
                  </h4>
                  <div className="space-y-3">
                    {selectedCiclo.ciclo1 && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-blue-500/30">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Primeiro Ciclo</p>
                          <p className="text-sm font-medium text-white">{selectedCiclo.ciclo1}</p>
                        </div>
                      </div>
                    )}
                    {selectedCiclo.ciclo2 && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-blue-500/30">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">2</div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Segundo Ciclo</p>
                          <p className="text-sm font-medium text-white">{selectedCiclo.ciclo2}</p>
                        </div>
                      </div>
                    )}
                    {selectedCiclo.ciclo3 && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-blue-500/30">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Terceiro Ciclo</p>
                          <p className="text-sm font-medium text-white">{selectedCiclo.ciclo3}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Correções */}
                <div className="bg-slate-900/50 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Correções e Retrabalho
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/30 rounded-lg border border-blue-500/30">
                      <p className="text-xs text-gray-400 mb-1">Horas de Correção</p>
                      <p className="text-xl font-bold text-white">{selectedCiclo.correcoes_horas.toFixed(1)}h</p>
                      <p className="text-xs text-gray-400 mt-1">de {selectedCiclo.total_horas.toFixed(1)}h totais</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg border border-blue-500/30">
                      <p className="text-xs text-gray-400 mb-1">Cards Corrigidos</p>
                      <p className="text-xl font-bold text-white">{selectedCiclo.correcoes_cards}</p>
                      <p className="text-xs text-gray-400 mt-1">de {selectedCiclo.total_cards} cards totais</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-slate-900/50 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Status Atual</h4>
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
