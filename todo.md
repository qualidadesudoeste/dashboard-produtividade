# TODO - Badge de Alerta para Sprints Longas

## Objetivo
Adicionar indicador visual automático (badge laranja) nos cards de auditorias para sprints com duração > 15 dias.

## Tarefas

### [ ] 1. Implementar Badge de Alerta
- Adicionar lógica condicional nos cards da lista de auditorias
- Verificar se `auditoria.duracao > 15`
- Exibir badge laranja "Sprint >15 dias" quando condição for verdadeira
- Posicionar badge ao lado do score ou abaixo do título

### [ ] 2. Estilizar Badge
- Cor: laranja (orange-500 ou warning)
- Ícone: AlertTriangle ou Clock
- Tamanho: pequeno (text-xs)
- Posicionamento: visível mas não intrusivo

### [ ] 3. Testar Funcionalidade
- Verificar auditorias com duração > 15 dias mostram badge
- Verificar auditorias com duração ≤ 15 dias NÃO mostram badge
- Testar responsividade do badge em diferentes tamanhos de tela

### [ ] 4. Documentar e Entregar
- Criar checkpoint
- Documentar funcionalidade implementada
