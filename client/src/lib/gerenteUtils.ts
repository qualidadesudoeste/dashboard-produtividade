/**
 * Busca o gerente responsável por um cliente baseado no mapeamento configurado
 */
export function getGerentePorCliente(cliente: string): string {
  const saved = localStorage.getItem('clienteGerenteMap');
  
  if (saved) {
    try {
      const mapeamentos = JSON.parse(saved);
      const map = mapeamentos.find((m: any) => 
        m.cliente.toUpperCase() === cliente.toUpperCase()
      );
      return map?.gerente || 'Não atribuído';
    } catch (error) {
      console.error('Erro ao carregar mapeamento de gerentes:', error);
    }
  }
  
  // Mapeamento padrão caso não haja configuração salva
  const padroes: Record<string, string> = {
    'SEFAZ': 'Luiz',
    'SEMOB': 'Luiz',
    'SEMED': 'Leidiane',
    'SMED': 'Leidiane',
    'TRANSALVADOR': 'Leidiane',
    'SEDUR': 'Fabíola',
    'SEMPRE': 'Wellington',
  };
  
  return padroes[cliente.toUpperCase()] || 'Não atribuído';
}

/**
 * Retorna todos os mapeamentos Cliente → Gerente
 */
export function getAllMapeamentos(): Array<{ cliente: string; gerente: string }> {
  const saved = localStorage.getItem('clienteGerenteMap');
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Erro ao carregar mapeamentos:', error);
    }
  }
  
  // Retornar mapeamentos padrão
  return [
    { cliente: 'SEFAZ', gerente: 'Luiz' },
    { cliente: 'SEMOB', gerente: 'Luiz' },
    { cliente: 'SEMED', gerente: 'Leidiane' },
    { cliente: 'SMED', gerente: 'Leidiane' },
    { cliente: 'TRANSALVADOR', gerente: 'Leidiane' },
    { cliente: 'SEDUR', gerente: 'Fabíola' },
    { cliente: 'SEMPRE', gerente: 'Wellington' },
  ];
}
