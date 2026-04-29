---
auto_execution_mode: 3
---
Workflows: Orquestrando Automações {#workflows}
Workflows combinam skills e rules para executar processos complexos de forma automática e consistente.
Anatomia de um Workflow
yamlworkflow:
  name: "feature-development-workflow"
  description: "Fluxo completo do desenvolvimento de uma feature"
  version: "1.0.0"
  triggers:
    - event: "pull_request_opened"
    - command: "/dev-workflow"
  steps:
    - step_1:
        name: "Code Review"
        skill: "code-review"
        rules: ["security-rules", "style-rules"]
        inputs:
          - code: "${PR.files}"
          - context: "${PROJECT.context}"
        outputs:
          - review_result: "PASS|FAIL|NEEDS_CHANGES"
        on_failure: "request_changes"
    
    - step_2:
        name: "Generate Tests"
        skill: "testing"
        depends_on: "step_1"
        condition: "${step_1.review_result == 'PASS'}"
        inputs:
          - coverage_target: "80%"
        outputs:
          - test_files: "generated"
    
    - step_3:
        name: "Performance Analysis"
        skill: "performance-analysis"
        rules: ["performance-rules"]
        depends_on: "step_2"
        parallel_allowed: false
    
    - step_4:
        name: "Documentation"
        skill: "documentation"
        depends_on: ["step_2", "step_3"]
  
  success_criteria:
    - "Todos os testes passam"
    - "Performance dentro dos limites"
    - "Documentação atualizada"
  
  notifications:
    - on_completion: "Slack"
    - on_failure: "Email"
Padrões de Workflows
1. Sequential Workflow (Sequencial)
Passos executam em ordem rigorosa.
yamlsequential:
  steps:
    - step_1: "Gerar código"
    - step_2: "Executar testes" # Aguarda step_1
    - step_3: "Deploy" # Aguarda step_2
2. Parallel Workflow (Paralelo)
Múltiplos passos executam simultaneamente.
yamlparallel:
  group_1: # Executa em paralelo
    - "Executar testes unitários"
    - "Análise estática"
    - "Security scan"
  join_point: "Todos precisam passar para continuar"
  step_2: "Deploy"
3. Conditional Workflow (Condicional)
Caminho varia baseado em condições.
yamlconditional:
  if: "${environment == 'production'}"
    then:
      - "Execute smoke tests"
      - "Verificar backups"
      - "Deploy com blue-green"
    else:
      - "Deploy direto em staging"
4. Loop Workflow (Iterativo)
Repetir até condição ser atendida.
yamlloop:
  for_each: "${changed_files}"
  do:
    - "Executar linters"
    - "Gerar relatório"
  until: "${all_files_compliant}"
5. Approval Workflow (Com Aprovação)
Requer intervenção humana em pontos críticos.
yamlapproval:
  steps:
    - step_1: "Gerar mudanças"
    - approval_gate:
        approvers: ["lead", "security-team"]
        timeout: "24h"
        escalation: "product-manager"
    - step_2: "Deploy aprovado"
Exemplos de Workflows Comuns
Feature Development Workflow
Novo Branch
    ↓
Desenvolvimento (Skill: code-generation)
    ↓
Code Review (Skill: code-review, Rule: style-rules)
    ↓
Testes (Skill: testing)
    ↓
Performance Check (Skill: performance-analysis)
    ↓
Documentação (Skill: documentation)
    ↓
PR Review (Human Approval)
    ↓
Merge & Deploy
Bug Fix Workflow
Issue Criada
    ↓
Análise (Skill: architectural-analysis)
    ↓
Identificar Root Cause (Skill: debug)
    ↓
Implementar Fix (Skill: code-generation)
    ↓
Testes de Regressão (Skill: testing)
    ↓
Deploy em Staging
    ↓
Validação (Human)
    ↓
Deploy em Production
Refactoring Workflow
Código Legado Identificado
    ↓
Análise de Impacto (Skill: architectural-analysis)
    ↓
Refactoring (Skill: refactoring)
    ↓
Testes Completos (Skill: testing)
    ↓
Performance Baseline (Skill: performance-analysis)
    ↓
Code Review (Rule: architecture-rules)
    ↓
Documentação de Mudanças (Skill: documentation)
    ↓
Merge Gradual
Boas Práticas para Workflows
✅ DO:

Manter workflows legíveis e bem documentados
Usar nomes descritivos para steps
Implementar tratamento de erros robusto
Incluir rollback strategies
Monitorar e alertar sobre falhas
Versionizar workflows
Testar workflows em staging antes de produção

❌ DON'T:

Workflows muito complexos (máximo ~10 steps)
Múltiplas aprovações sem necessidade
Long-running steps sem checkpoints
Dependências ocultas entre steps
Sem documentação de casos de falha
Mudar workflows em produção sem versionamento