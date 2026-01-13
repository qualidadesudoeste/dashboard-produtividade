# TODO - Adicionar Campos de Data e Duração da Sprint

## ✅ Contexto
- Adicionar campos: **dataInicio**, **dataFim**, **duracao** na interface Auditoria
- Preencher automaticamente com dados de ciclos_teste.json
- Exibir no formulário e no modal de detalhes
- Permitir edição manual

## 📋 Tarefas

### 1. Atualizar Interface TypeScript
- [ ] Adicionar campos na interface `Auditoria`:
  ```typescript
  interface Auditoria {
    id: string;
    projeto: string;
    sprint: string;
    dataInicio: string;  // NOVO
    dataFim: string;     // NOVO
    duracao: number;     // NOVO (em dias)
    data: string;        // data da auditoria
    auditor: string;
    checklist: Checklist;
    scoreTotal: number;
    status: "Aprovado" | "Aprovado com Ressalvas" | "Reprovado";
    observacoes: string;
    acoesCorretivas: string;
  }
  ```

### 2. Atualizar Rotina Automática
- [ ] Ler campos `inicio`, `fim`, `duracao` de ciclos_teste.json
- [ ] Preencher automaticamente ao criar auditorias:
  ```typescript
  novasAuditorias.push({
    // ... campos existentes
    dataInicio: ciclo.inicio,
    dataFim: ciclo.fim,
    duracao: ciclo.duracao,
  });
  ```

### 3. Atualizar Formulário
- [ ] Adicionar 3 campos no formulário de Nova Auditoria:
  - Data Início (date input)
  - Data Fim (date input)
  - Duração (number input, readonly calculado automaticamente)
- [ ] Calcular duração automaticamente quando início/fim mudarem
- [ ] Atualizar formData inicial com novos campos
- [ ] Atualizar reset do formulário

### 4. Atualizar Modal de Detalhes
- [ ] Exibir Data Início, Data Fim e Duração na seção de informações gerais
- [ ] Formato: "DD/MM/YYYY" para datas, "X dias" para duração

### 5. Atualizar Cards da Lista
- [ ] Considerar exibir duração no card (opcional)

## 🔄 Estrutura Atualizada

```typescript
interface Auditoria {
  id: string;
  projeto: string;
  sprint: string;
  dataInicio: string;      // "2025-12-01"
  dataFim: string;         // "2025-12-15"
  duracao: number;         // 14 (dias)
  data: string;            // data da auditoria
  auditor: string;
  checklist: Checklist;
  scoreTotal: number;
  status: "Aprovado" | "Aprovado com Ressalvas" | "Reprovado";
  observacoes: string;
  acoesCorretivas: string;
}
```

## 📊 Dados de ciclos_teste.json

Estrutura esperada:
```json
{
  "cliente": "SEDUR",
  "projeto": "FISCALIZAÇÃO",
  "sprint": "22.0.0",
  "inicio": "2025-11-18",
  "fim": "2025-12-02",
  "duracao": 14,
  // ... outros campos
}
```
