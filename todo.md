# TODO - Ajustes Finais nas Listas

## 1. Expandir Ranking Colaboradores
- [ ] Remover `.slice(0, 10)` do rankingColaboradores
- [ ] Mostrar TODOS os colaboradores
- [ ] Atualizar contador no título (remover "Top 10")
- [ ] Manter busca funcional

## 2. Manter Posição Original ao Filtrar
- [ ] Distribuição por Tipo: usar índice do array original (tipoDataFull)
- [ ] Distribuição por Status: usar índice do array original (statusDataFull)
- [ ] Ranking Projetos: usar índice do array original (rankingProjetosFull)
- [ ] Ranking Colaboradores: usar índice do array original (rankingColaboradoresFull)

## 3. Remover Ícones dos Títulos
- [ ] Distribuição por Tipo: remover `<TrendingUp />`
- [ ] Ranking Projetos: remover `<Trophy />`
- [ ] Distribuição por Status: remover `<CheckCircle2 />`
- [ ] Ranking Colaboradores: remover `<Crown />`

## Implementação

### Estratégia para Posição Original:
```typescript
// Antes (errado - renumera após filtro):
{tipoData.map((item, idx) => (
  <div key={item.name}>
    <div>{idx + 1}</div> // ❌ Sempre 1, 2, 3...
  </div>
))}

// Depois (correto - mantém posição original):
{tipoData.map((item) => {
  const originalIdx = tipoDataFull.findIndex(x => x.name === item.name);
  return (
    <div key={item.name}>
      <div>{originalIdx + 1}</div> // ✅ Posição real no ranking
    </div>
  );
})}
```

## Checklist
- [ ] Editar Home.tsx
- [ ] Remover slice(0, 10) de colaboradores
- [ ] Adicionar lógica de findIndex para todas as 4 listas
- [ ] Remover 4 ícones dos CardTitle
- [ ] Testar filtros e verificar numeração
- [ ] Salvar checkpoint
