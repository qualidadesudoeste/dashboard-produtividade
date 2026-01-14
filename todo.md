# TODO - Correção de Bugs na Auditoria

## Bugs Identificados

### Bug 1: Datas não preenchidas ao editar
**Problema:** Ao clicar em "Editar" auditoria, os campos Data Início Sprint e Data Fim Sprint ficam vazios, mesmo a auditoria tendo essas informações.

**Causa:** A função `handleEditarAuditoria` não está preenchendo os campos `dataInicio` e `dataFim` no `formData`.

**Solução:** Adicionar `dataInicio` e `dataFim` ao setFormData dentro de handleEditarAuditoria.

### Bug 2: Botões X duplicados no modal
**Problema:** Modal de formulário tem dois botões X para fechar (um do DialogHeader e outro customizado).

**Causa:** Provavelmente há um botão X customizado além do botão padrão do Dialog.

**Solução:** Remover botão X duplicado, manter apenas o padrão do DialogHeader.

## Tarefas

### [ ] 1. Corrigir preenchimento de datas ao editar
- Localizar função `handleEditarAuditoria`
- Adicionar `dataInicio: auditoria.dataInicio` ao setFormData
- Adicionar `dataFim: auditoria.dataFim` ao setFormData

### [ ] 2. Remover botão X duplicado
- Localizar modal de formulário (Dialog)
- Identificar botão X customizado duplicado
- Remover botão duplicado

### [ ] 3. Testar correções
- Abrir edição de auditoria e verificar datas preenchidas
- Verificar que há apenas 1 botão X no modal

### [ ] 4. Documentar e entregar
- Criar checkpoint
- Documentar correções aplicadas
