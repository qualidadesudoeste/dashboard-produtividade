# TODO - Rotina Automática de Criação de Auditorias

## ✅ Contexto
- Usar dados da página **Ciclos de Teste** como fonte
- Criar auditorias vazias automaticamente para cada projeto/sprint
- Evitar duplicação de auditorias já existentes
- Executar ao carregar página de Auditoria

## 📋 Tarefas

### 1. Analisar Estrutura de Dados
- [ ] Ler CiclosTeste.tsx para entender estrutura de dados
- [ ] Identificar como projetos e sprints estão organizados
- [ ] Verificar se há campo de identificação única de sprint

### 2. Implementar Rotina Automática
- [ ] Criar função `criarAuditoriasAutomaticas()` em Auditoria.tsx
- [ ] Ler dados do data.json (mesma fonte que Ciclos de Teste)
- [ ] Extrair lista única de Projeto + Sprint
- [ ] Para cada combinação, verificar se já existe auditoria
- [ ] Se não existir, criar auditoria vazia com:
  - projeto: nome do projeto
  - sprint: identificação da sprint
  - data: data atual
  - auditor: "Pendente"
  - checklist: todos os 15 critérios = false
  - scoreTotal: 0
  - status: "Reprovado"
  - observacoes: ""
  - acoesCorretivas: ""

### 3. Integrar com useEffect
- [ ] Adicionar useEffect que executa ao montar componente
- [ ] Executar apenas uma vez (dependency array vazio)
- [ ] Salvar auditorias criadas no localStorage

### 4. Evitar Duplicação
- [ ] Criar chave única: `${projeto}_${sprint}`
- [ ] Verificar se já existe auditoria com mesma chave
- [ ] Pular criação se já existir

### 5. Feedback Visual
- [ ] Mostrar toast/notificação quando auditorias forem criadas
- [ ] Indicar quantas auditorias foram criadas automaticamente

## 🔄 Lógica de Criação

```typescript
useEffect(() => {
  // Executar apenas uma vez ao montar
  if (data.length > 0 && auditorias.length === 0) {
    criarAuditoriasAutomaticas();
  }
}, [data]);

const criarAuditoriasAutomaticas = () => {
  // 1. Extrair projetos e sprints únicos do data.json
  const sprintsUnicas = extrairSprintsUnicas(data);
  
  // 2. Para cada sprint, verificar se já existe auditoria
  const novasAuditorias: Auditoria[] = [];
  
  sprintsUnicas.forEach(({ projeto, sprint }) => {
    const jaExiste = auditorias.some(
      (aud) => aud.projeto === projeto && aud.sprint === sprint
    );
    
    if (!jaExiste) {
      novasAuditorias.push({
        id: `${Date.now()}_${projeto}_${sprint}`,
        projeto,
        sprint,
        data: new Date().toISOString().split("T")[0],
        auditor: "Pendente",
        checklist: {
          makerCompass: false,
          especificacaoRequisitos: false,
          // ... todos os 15 critérios false
        },
        scoreTotal: 0,
        status: "Reprovado",
        observacoes: "",
        acoesCorretivas: "",
      });
    }
  });
  
  // 3. Salvar no localStorage
  if (novasAuditorias.length > 0) {
    const todasAuditorias = [...auditorias, ...novasAuditorias];
    setAuditorias(todasAuditorias);
    localStorage.setItem("auditorias", JSON.stringify(todasAuditorias));
    
    // 4. Notificar usuário
    console.log(`${novasAuditorias.length} auditorias criadas automaticamente`);
  }
};
```

## 🎯 Resultado Esperado

- Ao abrir página de Auditoria pela primeira vez, auditorias vazias são criadas automaticamente
- Cada projeto/sprint dos Ciclos de Teste terá uma auditoria correspondente
- Auditorias aparecem na lista com status "Reprovado" (0%)
- Usuário pode clicar e preencher os checklists
