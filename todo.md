# TODO - Funcionalidade de Edição de Auditorias

## ✅ Contexto
- Permitir edição de auditorias já criadas automaticamente
- Botão "Editar" nos cards da lista
- Formulário preenchido com dados existentes
- Salvar atualiza registro (não cria novo)

## 📋 Tarefas

### 1. Adicionar Estado de Edição
- [ ] Criar estado `editandoAuditoria` para armazenar auditoria sendo editada
- [ ] Diferenciar modo "Nova" vs "Editar"

### 2. Adicionar Botão Editar
- [ ] Adicionar botão "Editar" (ícone lápis) nos cards
- [ ] Ao clicar, preencher formulário com dados da auditoria
- [ ] Abrir modal do formulário

### 3. Atualizar Lógica de Salvamento
- [ ] Se `editandoAuditoria` existe → atualizar registro
- [ ] Se não existe → criar novo registro
- [ ] Manter ID original ao editar

### 4. Atualizar Título do Modal
- [ ] "Nova Auditoria de Sprint" quando criando
- [ ] "Editar Auditoria de Sprint" quando editando

### 5. Reset ao Fechar
- [ ] Limpar `editandoAuditoria` ao fechar modal
- [ ] Limpar formulário

## 🔄 Fluxo de Edição

```typescript
// Estado
const [editandoAuditoria, setEditandoAuditoria] = useState<Auditoria | null>(null);

// Abrir edição
const handleEditarAuditoria = (auditoria: Auditoria) => {
  setEditandoAuditoria(auditoria);
  setFormData({
    projeto: auditoria.projeto,
    sprint: auditoria.sprint,
    dataInicio: auditoria.dataInicio,
    dataFim: auditoria.dataFim,
    duracao: auditoria.duracao,
    data: auditoria.data,
    auditor: auditoria.auditor,
    checklist: { ...auditoria.checklist },
    observacoes: auditoria.observacoes,
    acoesCorretivas: auditoria.acoesCorretivas,
  });
  setIsFormOpen(true);
};

// Salvar
const handleSalvarAuditoria = () => {
  if (editandoAuditoria) {
    // EDITAR: atualizar registro existente
    const auditorias Atualizadas = auditorias.map((aud) =>
      aud.id === editandoAuditoria.id
        ? { ...novaAuditoria, id: editandoAuditoria.id }
        : aud
    );
    setAuditorias(auditoriasAtualizadas);
  } else {
    // CRIAR: adicionar novo registro
    const novasAuditorias = [...auditorias, novaAuditoria];
    setAuditorias(novasAuditorias);
  }
};

// Fechar
const handleFecharFormulario = () => {
  setIsFormOpen(false);
  setEditandoAuditoria(null);
  // reset formData
};
```

## 🎨 UI

**Botão Editar:**
- Ícone: Pencil (lucide-react)
- Cor: Azul
- Posição: Ao lado do botão "Ver Detalhes"
- Tooltip: "Editar auditoria"

**Título do Modal:**
- Criar: "Nova Auditoria de Sprint"
- Editar: "Editar Auditoria - {projeto} {sprint}"
