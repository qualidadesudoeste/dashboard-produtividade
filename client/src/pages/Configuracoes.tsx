import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Plus, Trash2, Save } from 'lucide-react';

interface ClienteGerenteMap {
  cliente: string;
  gerente: string;
}

export default function Configuracoes() {
  const [mapeamentos, setMapeamentos] = useState<ClienteGerenteMap[]>([]);
  const [novoCliente, setNovoCliente] = useState('');
  const [novoGerente, setNovoGerente] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Carregar mapeamentos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clienteGerenteMap');
    if (saved) {
      setMapeamentos(JSON.parse(saved));
    } else {
      // Mapeamentos padrão
      const padroes: ClienteGerenteMap[] = [
        { cliente: 'SEFAZ', gerente: 'Luiz' },
        { cliente: 'SEMOB', gerente: 'Luiz' },
        { cliente: 'SEMED', gerente: 'Leidiane' },
        { cliente: 'SMED', gerente: 'Leidiane' },
        { cliente: 'TRANSALVADOR', gerente: 'Leidiane' },
        { cliente: 'SEDUR', gerente: 'Fabíola' },
        { cliente: 'SEMPRE', gerente: 'Wellington' },
      ];
      setMapeamentos(padroes);
      localStorage.setItem('clienteGerenteMap', JSON.stringify(padroes));
    }
  }, []);

  const salvarMapeamentos = () => {
    localStorage.setItem('clienteGerenteMap', JSON.stringify(mapeamentos));
    setMensagem('✅ Mapeamentos salvos com sucesso!');
    setTimeout(() => setMensagem(''), 3000);
    
    // Recarregar página para aplicar mudanças
    window.location.reload();
  };

  const adicionarMapeamento = () => {
    if (!novoCliente.trim() || !novoGerente.trim()) {
      setMensagem('⚠️ Preencha Cliente e Gerente');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }

    const existe = mapeamentos.find(m => m.cliente.toUpperCase() === novoCliente.trim().toUpperCase());
    if (existe) {
      setMensagem('⚠️ Cliente já existe no mapeamento');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }

    const novos = [...mapeamentos, { cliente: novoCliente.trim().toUpperCase(), gerente: novoGerente.trim() }];
    setMapeamentos(novos);
    setNovoCliente('');
    setNovoGerente('');
  };

  const removerMapeamento = (cliente: string) => {
    const novos = mapeamentos.filter(m => m.cliente !== cliente);
    setMapeamentos(novos);
  };

  const editarGerente = (cliente: string, novoGerente: string) => {
    const novos = mapeamentos.map(m => 
      m.cliente === cliente ? { ...m, gerente: novoGerente } : m
    );
    setMapeamentos(novos);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Configurações</h1>
            <p className="text-gray-300 mt-1">Gerencie mapeamentos Cliente → Gerente</p>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {mensagem && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-white">
            {mensagem}
          </div>
        )}

        {/* Card de Mapeamentos */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center justify-between">
              Mapeamento Cliente → Gerente
              <Button
                onClick={salvarMapeamentos}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Adicionar novo mapeamento */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">Adicionar Novo Mapeamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Cliente</label>
                  <Input
                    placeholder="Ex: SEFAZ"
                    value={novoCliente}
                    onChange={(e) => setNovoCliente(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Gerente</label>
                  <Input
                    placeholder="Ex: Luiz"
                    value={novoGerente}
                    onChange={(e) => setNovoGerente(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={adicionarMapeamento}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabela de mapeamentos */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Mapeamentos Atuais ({mapeamentos.length})</h3>
              <div className="bg-slate-800/30 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-semibold">Cliente</th>
                      <th className="text-left p-4 text-gray-300 font-semibold">Gerente</th>
                      <th className="text-right p-4 text-gray-300 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mapeamentos.map((map, index) => (
                      <tr
                        key={index}
                        className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="p-4 text-white font-medium">{map.cliente}</td>
                        <td className="p-4">
                          <Input
                            value={map.gerente}
                            onChange={(e) => editarGerente(map.cliente, e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white max-w-xs"
                          />
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => removerMapeamento(map.cliente)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-semibold text-blue-400 mb-2">ℹ️ Informações Importantes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Os mapeamentos são aplicados automaticamente aos Ciclos de Teste e Auditorias</li>
                <li>Clique em "Salvar Alterações" para aplicar as mudanças</li>
                <li>A página será recarregada automaticamente após salvar</li>
                <li>Os dados são armazenados localmente no navegador</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
