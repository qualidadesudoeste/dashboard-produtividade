import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Upload, FileSpreadsheet, Save, Plus, Trash2 } from 'lucide-react';

interface ClienteGerenteMap {
  cliente: string;
  gerente: string;
}

export default function Configuracoes() {
  const [mapeamentos, setMapeamentos] = useState<ClienteGerenteMap[]>([]);
  const [novoCliente, setNovoCliente] = useState('');
  const [novoGerente, setNovoGerente] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [processando, setProcessando] = useState(false);
  
  const dashboardInputRef = useRef<HTMLInputElement>(null);
  const ciclosInputRef = useRef<HTMLInputElement>(null);

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

  const handleDashboardUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessando(true);
    setMensagem('⏳ Processando Dashboard.xls...');

    try {
      // Importar biblioteca xlsx dinamicamente
      const XLSX = await import('xlsx');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Ler primeira planilha
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Processar dados e extrair Cliente do Projeto
          const dadosProcessados = jsonData.map((row: any) => {
            const projeto = row.Projeto || '';
            const partes = projeto.split(' - ');
            const cliente = partes[0]?.trim() || '';
            
            // Buscar gerente do mapeamento
            const map = mapeamentos.find(m => m.cliente.toUpperCase() === cliente.toUpperCase());
            const gerente = map?.gerente || 'Não atribuído';

            return {
              Colaborador: row.Colaborador || '',
              Projeto: projeto,
              Atividade: row.Atividade || '',
              Tipo: row.Tipo || '',
              Status: row.Status || '',
              Início: row['Início'] || row.Inicio || '',
              Fim: row.Fim || '',
              'Hrs Trab.': row['Hrs Trab.'] || '',
              PF: row.PF || 0,
              Cliente: cliente,
              Gerente: gerente
            };
          });

          // Salvar no localStorage
          localStorage.setItem('dashboardData', JSON.stringify(dadosProcessados));
          
          setMensagem(`✅ Dashboard atualizado! ${dadosProcessados.length} registros processados.`);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setMensagem('❌ Erro ao processar Dashboard.xls');
          setTimeout(() => setMensagem(''), 5000);
        } finally {
          setProcessando(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
      setMensagem('❌ Erro ao carregar biblioteca de processamento');
      setTimeout(() => setMensagem(''), 5000);
      setProcessando(false);
    }

    // Limpar input
    if (event.target) event.target.value = '';
  };

  const handleCiclosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessando(true);
    setMensagem('⏳ Processando Ciclos de Teste...');

    try {
      // Importar biblioteca xlsx dinamicamente
      const XLSX = await import('xlsx');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Ler primeira planilha
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);

          // Processar dados
          const ciclosProcessados = jsonData.map((row: any) => {
            // Extrair colunas fixas
            const gerente = row.GERENTE || row.Gerente || '';
            const cliente = row.CLIENTE || row.Cliente || '';
            const projeto = row.PROJETO || row.Projeto || '';
            const sprint = row.SPRINT || row.Sprint || '';
            const inicio = row['INÍCIO'] || row.Início || row.INICIO || row.Inicio || '';
            const fim = row.FIM || row.Fim || '';
            const duracao = row['DURAÇÃO'] || row.Duração || row.DURACAO || row.Duracao || 0;
            const status = row.STATUS || row.Status || '';
            const correcoes_horas = row['CORREÇÕES (horas)'] || row['Correções (horas)'] || 0;
            const correcoes_cards = row['CORREÇÕES (cards)'] || row['Correções (cards)'] || 0;
            const total_horas = row['TOTAL (horas)'] || row['Total (horas)'] || 0;
            const total_cards = row['TOTAL (cards)'] || row['Total (cards)'] || 0;
            const tempo_previsto = row['TEMPO PREVISTO'] || row['Tempo Previsto'] || 0;
            const retrabalho = row['RETRABALHO (Tempo)'] || row['Retrabalho (Tempo)'] || 0;

            // Extrair colunas de ciclos dinamicamente
            const ciclos: Record<string, string> = {};
            Object.keys(row).forEach(key => {
              // Detectar colunas de ciclo (padrão: "Xº CICLO" ou "X CICLO")
              if (key.includes('CICLO') || key.includes('Ciclo')) {
                const valor = row[key];
                if (valor) {
                  // Normalizar nome da coluna (ex: "1º CICLO" -> "ciclo1")
                  const numero = key.match(/(\d+)/)?.[1];
                  if (numero) {
                    ciclos[`ciclo${numero}`] = valor;
                  }
                }
              }
            });

            // Converter datas do Excel para formato DD/MM/YYYY
            const formatarData = (valor: any) => {
              if (!valor) return '';
              if (typeof valor === 'number') {
                // Data do Excel (número de dias desde 1900-01-01)
                const date = XLSX.SSF.parse_date_code(valor);
                return `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
              }
              return String(valor);
            };

            return {
              gerente,
              cliente,
              projeto,
              sprint,
              inicio: formatarData(inicio),
              fim: formatarData(fim),
              duracao: Number(duracao) || 0,
              ...ciclos,
              status,
              correcoes_horas: Number(correcoes_horas) || 0,
              correcoes_cards: Number(correcoes_cards) || 0,
              total_horas: Number(total_horas) || 0,
              total_cards: Number(total_cards) || 0,
              tempo_previsto: Number(tempo_previsto) || 0,
              retrabalho: Number(retrabalho) || 0
            };
          });

          // Salvar no localStorage
          localStorage.setItem('ciclosTesteData', JSON.stringify(ciclosProcessados));
          
          setMensagem(`✅ Ciclos de Teste atualizados! ${ciclosProcessados.length} registros processados.`);
          setTimeout(() => {
            window.location.href = '/ciclos-teste';
          }, 2000);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setMensagem('❌ Erro ao processar Ciclos de Teste');
          setTimeout(() => setMensagem(''), 5000);
        } finally {
          setProcessando(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
      setMensagem('❌ Erro ao carregar biblioteca de processamento');
      setTimeout(() => setMensagem(''), 5000);
      setProcessando(false);
    }

    // Limpar input
    if (event.target) event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Configurações</h1>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {mensagem && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-white">
            {mensagem}
          </div>
        )}

        {/* Card de Upload */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload de Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Dashboard */}
              <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Dashboard</h3>
                    <p className="text-sm text-gray-400">Arquivo Excel (.xls, .xlsx)</p>
                  </div>
                </div>
                <input
                  ref={dashboardInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleDashboardUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => dashboardInputRef.current?.click()}
                  disabled={processando}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {processando ? 'Processando...' : 'Upload Dashboard.xls'}
                </Button>
              </div>

              {/* Upload Ciclos de Teste */}
              <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-orange-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Ciclos de Teste</h3>
                    <p className="text-sm text-gray-400">Arquivo Excel (.xls, .xlsx)</p>
                  </div>
                </div>
                <input
                  ref={ciclosInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleCiclosUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => ciclosInputRef.current?.click()}
                  disabled={processando}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {processando ? 'Processando...' : 'Upload CiclosdeTeste.xlsx'}
                </Button>
              </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-semibold text-blue-400 mb-2">ℹ️ Instruções:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Faça upload do arquivo <strong>Dashboard.xls</strong> para atualizar os dados do Dashboard</li>
                <li>Faça upload do arquivo <strong>CiclosdeTeste.xlsx</strong> para atualizar os Ciclos de Teste</li>
                <li>As colunas de ciclos (1º CICLO, 2º CICLO, etc.) são detectadas automaticamente</li>
                <li>Os dados serão processados e você será redirecionado para a tela correspondente</li>
                <li>Aguarde a confirmação antes de navegar para outras páginas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card de Mapeamentos (sem plano de fundo destacado) */}
        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center justify-between">
              Mapeamento Cliente → Gerente
              <Button
                onClick={salvarMapeamentos}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adicionar novo mapeamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Cliente (ex: SEFAZ)"
                value={novoCliente}
                onChange={(e) => setNovoCliente(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                placeholder="Gerente (ex: Luiz)"
                value={novoGerente}
                onChange={(e) => setNovoGerente(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={adicionarMapeamento}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Tabela de mapeamentos */}
            <div className="bg-slate-800/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left p-3 text-gray-300 text-sm">Cliente</th>
                    <th className="text-left p-3 text-gray-300 text-sm">Gerente</th>
                    <th className="text-right p-3 text-gray-300 text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mapeamentos.map((map, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-3 text-white text-sm">{map.cliente}</td>
                      <td className="p-3">
                        <Input
                          value={map.gerente}
                          onChange={(e) => editarGerente(map.cliente, e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-sm h-8"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          onClick={() => removerMapeamento(map.cliente)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
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
