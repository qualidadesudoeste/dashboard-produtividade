import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

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

  // Filtros
  const ciclosFiltrados = ciclos.filter((ciclo) => {
    const matchCliente = filtroCliente === "Todos" || ciclo.cliente === filtroCliente;
    const matchStatus = filtroStatus === "Todos" || ciclo.status === filtroStatus;
    return matchCliente && matchStatus;
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
    const badge = badges[status] || { bg: "bg-gray-500/20", text: "text-gray-400", icon: Activity };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0F1729] to-[#0A0E1A] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent gradient-animated">
          Ciclos de Teste
        </h1>
        <p className="text-gray-400">Gestão de testes e bugs - Janeiro 2026</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="hover-lift">
          <label className="block text-sm font-medium text-gray-300 mb-2">Cliente</label>
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
          >
            {clientes.map((cliente) => (
              <option key={cliente} value={cliente}>
                {cliente}
              </option>
            ))}
          </select>
        </div>

        <div className="hover-lift">
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover-border-glow transition-all"
          >
            {statusList.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total de Ciclos</h3>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{totalCiclos}</p>
          <p className="text-sm text-gray-500">Projetos em teste</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total de Horas</h3>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{totalHoras.toFixed(1)}<span className="text-xl text-gray-500 ml-1">h</span></p>
          <p className="text-sm text-gray-500">Tempo total investido</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total de Cards</h3>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{totalCards}</p>
          <p className="text-sm text-gray-500">Atividades testadas</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 hover-lift hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Retrabalho Médio</h3>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{retrabalhoMedio.toFixed(1)}<span className="text-xl text-gray-500 ml-1">%</span></p>
          <p className="text-sm text-gray-500">Taxa de correções</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição por Status */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover-lift hover-border-glow">
          <h3 className="text-xl font-semibold text-white mb-6">Distribuição por Status</h3>
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
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover-lift hover-border-glow">
          <h3 className="text-xl font-semibold text-white mb-6">Top 10 - Maior Retrabalho</h3>
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
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8 hover-lift hover-border-glow">
        <h3 className="text-xl font-semibold text-white mb-6">Top 10 - Maior Duração</h3>
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
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover-lift hover-border-glow">
        <h3 className="text-xl font-semibold text-white mb-6">Detalhamento dos Ciclos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Projeto</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Sprint</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Duração</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Horas</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Cards</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Retrabalho</th>
              </tr>
            </thead>
            <tbody>
              {ciclosFiltrados.map((ciclo, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{ciclo.cliente}</td>
                  <td className="py-3 px-4 text-gray-300">{ciclo.projeto}</td>
                  <td className="py-3 px-4 text-gray-400">{ciclo.sprint}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{ciclo.duracao} dias</td>
                  <td className="py-3 px-4">{getStatusBadge(ciclo.status)}</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.total_horas.toFixed(1)}h</td>
                  <td className="py-3 px-4 text-right text-white">{ciclo.total_cards}</td>
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
    </div>
  );
}
