# TODO - Correção Auditoria com 15 Critérios Maker Express

## ✅ Contexto CORRETO
- Auditorias são por **Sprint** de cada projeto
- **Maker Express** tem **15 critérios** (sim/não)
- **Maker Compass** é o PRIMEIRO critério
- Score baseado em % de conformidade (itens atendidos / 15)

## 📝 Lista Completa dos 15 Critérios Maker Express

1. **Maker Compass**
2. Especificação de Requisitos
3. Planejamento da Sprint (Planning)
4. Cards criados no SIG
5. Estimativas feitas via Planning Poker
6. Tempo máximo por card ≤ 420 min (7h)
7. Devs utilizam Play/Pause no SIG e registram % de evolução
8. Impedimentos registrados no SIG
9. Daily-E (Equipe)
10. Daily-C (Cliente)
11. Contagem de PF realizada com o plugin
12. QA testou 100% da Sprint antes da entrega
13. Review realizada com cliente e time completo
14. Retrospectiva realizada ao final da Sprint
15. Sprint Quinzenal (≤ 15 dias)

## 🔧 Correções Necessárias

### 1. Corrigir Erro Atual
- [ ] Erro: "Cannot read properties of undefined (reading 'especificacaoRequisitos')"
- [ ] Causa: localStorage tem auditorias antigas com estrutura diferente
- [ ] Solução: Limpar localStorage ou migrar dados

### 2. Atualizar Labels dos Critérios
- [ ] Adicionar "Maker Compass" como primeiro critério
- [ ] Ajustar array CRITERIOS_LABELS para 15 itens
- [ ] Ajustar array CRITERIOS_KEYS para 15 chaves

### 3. Atualizar Interface Checklist
- [ ] Adicionar campo `makerCompass: boolean`
- [ ] Total de 15 campos booleanos

## 🔄 Nova Estrutura de Dados

```typescript
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
```

## 📊 Cálculo de Score

- **Fórmula**: (critérios marcados / 15) × 100
- **Status**:
  - >= 80%: Aprovado
  - 60-79%: Aprovado com Ressalvas
  - < 60%: Reprovado
