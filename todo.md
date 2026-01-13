# TODO - Página de Auditoria Funcional

## Objetivo
Transformar a página de Auditoria em uma ferramenta completa para:
1. Realizar auditorias de projetos
2. Visualizar histórico de auditorias
3. Gerenciar status de qualidade dos projetos

## Estrutura da Página

### 1. Header com KPIs
- [ ] Total de Auditorias Realizadas
- [ ] Taxa de Conformidade Média
- [ ] Projetos Críticos (score < 60%)
- [ ] Última Auditoria (data)

### 2. Botão "Nova Auditoria"
- [ ] Abre modal/formulário para criar auditoria
- [ ] Destaque visual (botão azul primário)

### 3. Formulário de Nova Auditoria
- [ ] Select: Projeto (lista de projetos do data.json)
- [ ] Input: Data da Auditoria
- [ ] Input: Auditor (nome)
- [ ] Checklist de Critérios (5-8 itens):
  - Documentação Completa (0-100)
  - Qualidade do Código (0-100)
  - Testes Implementados (0-100)
  - Conformidade com Requisitos (0-100)
  - Desempenho (0-100)
  - Segurança (0-100)
- [ ] Textarea: Observações Gerais
- [ ] Textarea: Ações Corretivas (se score < 70%)
- [ ] Select: Status (Aprovado / Aprovado com Ressalvas / Reprovado)
- [ ] Botão: Salvar Auditoria

### 4. Lista de Auditorias
- [ ] Tabela ou Cards com:
  - Projeto
  - Data
  - Auditor
  - Score Total (média dos critérios)
  - Status (badge colorido)
  - Ações (Ver Detalhes, Editar, Excluir)
- [ ] Filtros:
  - Por Projeto
  - Por Período
  - Por Status
  - Por Auditor
- [ ] Ordenação:
  - Data (mais recente primeiro)
  - Score (menor primeiro para priorizar críticos)
  - Projeto (alfabético)

### 5. Modal de Detalhes da Auditoria
- [ ] Informações gerais (projeto, data, auditor, status)
- [ ] Gráfico radar com scores dos critérios
- [ ] Lista de critérios com pontuações
- [ ] Observações
- [ ] Ações corretivas
- [ ] Botão: Fechar

### 6. Persistência de Dados
- [ ] localStorage para salvar auditorias
- [ ] Estrutura JSON:
```json
{
  "id": "uuid",
  "projeto": "Nome do Projeto",
  "data": "2026-01-13",
  "auditor": "Nome do Auditor",
  "criterios": {
    "documentacao": 85,
    "codigo": 90,
    "testes": 75,
    "requisitos": 95,
    "desempenho": 80,
    "seguranca": 88
  },
  "scoreTotal": 85.5,
  "status": "Aprovado",
  "observacoes": "Texto...",
  "acoesCorretivas": "Texto..."
}
```

## Design

### Paleta de Cores (Azul Monocromático)
- Aprovado: bg-blue-100 text-blue-700
- Aprovado com Ressalvas: bg-blue-200 text-blue-800
- Reprovado: bg-blue-900 text-white
- Score >= 80: verde (exceção à paleta azul para clareza)
- Score 60-79: amarelo
- Score < 60: vermelho

### Layout
- Grid 2 colunas: Formulário (esquerda) + Lista (direita) em desktop
- Stack vertical em mobile
- Cards com sombras e hover effects
- Animações suaves

## Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Ler Auditoria.tsx atual
- [ ] Criar estrutura de estados (auditorias, formData, filtros)
- [ ] Implementar KPIs no header
- [ ] Adicionar botão "Nova Auditoria"

### Fase 2: Formulário
- [ ] Criar componente de formulário
- [ ] Implementar validação
- [ ] Conectar com lista de projetos do data.json
- [ ] Calcular score total automaticamente
- [ ] Salvar em localStorage

### Fase 3: Lista e Visualização
- [ ] Criar tabela/cards de auditorias
- [ ] Implementar filtros
- [ ] Criar modal de detalhes
- [ ] Adicionar ações (editar, excluir)
- [ ] Implementar gráfico radar (opcional)

### Fase 4: Testes
- [ ] Criar auditoria de teste
- [ ] Testar filtros
- [ ] Testar persistência (reload página)
- [ ] Testar responsividade
- [ ] Validar cálculos de score

## Critérios de Auditoria Sugeridos

1. **Documentação Completa** (0-100)
   - README atualizado
   - Comentários no código
   - Documentação de API
   - Diagramas técnicos

2. **Qualidade do Código** (0-100)
   - Padrões de código seguidos
   - Código limpo e legível
   - Sem duplicação
   - Boas práticas

3. **Testes Implementados** (0-100)
   - Cobertura de testes
   - Testes unitários
   - Testes de integração
   - Testes E2E

4. **Conformidade com Requisitos** (0-100)
   - Requisitos funcionais atendidos
   - Requisitos não-funcionais atendidos
   - Validação com stakeholders

5. **Desempenho** (0-100)
   - Tempo de resposta
   - Otimização de queries
   - Uso de recursos
   - Escalabilidade

6. **Segurança** (0-100)
   - Autenticação/Autorização
   - Validação de inputs
   - Proteção contra vulnerabilidades
   - Logs de auditoria

## Fórmulas

- **Score Total**: Média aritmética dos 6 critérios
- **Taxa de Conformidade**: (Auditorias Aprovadas / Total Auditorias) × 100
- **Status Automático**:
  - Score >= 80: Aprovado
  - Score 60-79: Aprovado com Ressalvas
  - Score < 60: Reprovado
