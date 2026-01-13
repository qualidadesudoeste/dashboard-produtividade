# TODO - Correção de Ordem de Hooks

## Problema Identificado
- [ ] Erro: "Rendered more hooks than during the previous render"
- [ ] Causa: useMemo hooks foram colocados após useEffect, violando regra de ordem consistente de hooks

## Correção Necessária
- [ ] Mover useMemo (colaboradores e projetos) para ANTES do useEffect
- [ ] Garantir ordem consistente: useState → useMemo → useEffect → funções regulares
- [ ] Testar no navegador após correção
- [ ] Salvar checkpoint com correção aplicada
