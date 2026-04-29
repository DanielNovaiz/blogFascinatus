---
trigger: always_on
---
1. Style Rules (Estilo)
Definem consistência de código e formatação.
yamlstyle-rule:
  name: "coding-standards"
  applies_to: ["Python", "JavaScript"]
  patterns:
    - naming: "snake_case para variáveis e funções"
    - indentation: "4 espaços"
    - line_length: "máximo 88 caracteres (Black formatter)"
    - imports: "imports em ordem alfabética"
  exceptions:
    - "Variáveis de classe podem usar UPPER_CASE"
2. Architecture Rules (Arquitetura)
Definem padrões estruturais e organizacionais.
yamlarchitecture-rule:
  name: "layered-architecture"
  layers:
    - presentation: "Controllers, Views, UI"
    - business: "Services, Business Logic"
    - persistence: "Repositories, Data Access"
    - domain: "Models, Entities"
  restrictions:
    - "Camadas superiores podem chamar inferiores"
    - "Camadas inferiores nunca chamam superiores"
    - "Services não devem conhecer Controllers"
3. Security Rules (Segurança)
Definem diretrizes de segurança e conformidade.
yamlsecurity-rule:
  name: "data-protection"
  requirements:
    - "Senhas nunca em logs"
    - "APIs precisam de autenticação"
    - "Inputs sempre validados"
    - "SQL sempre com prepared statements"
  forbidden:
    - "Hard-coded credentials"
    - "Eval ou exec dinâmico"
    - "Desserialização não verificada"
4. Performance Rules (Desempenho)
Definem limites e otimizações esperadas.
yamlperformance-rule:
  name: "optimization-targets"
  targets:
    - "Queries: máximo 1 round trip por request"
    - "APIs: resposta < 200ms (p95)"
    - "Bundle: < 100kb gzipped"
    - "Cache: TTL mínimo 5 minutos"
  monitoring:
    - "APM integrado"
    - "Alertas em degradação"
5. Domain Rules (Domínio)
Definem regras específicas do negócio.
yamldomain-rule:
  name: "business-logic"
  rules:
    - "Usuários só veem dados próprios"
    - "Transações precisam de aprovação acima de $1000"
    - "Relatórios gerados diariamente às 2am"
    - "Backup: full diário, incremental a cada hora"
Estrutura Recomendada de Rules
rules/
├── security/
│   ├── authentication.md
│   ├── authorization.md
│   └── data-protection.md
├── architecture/
│   ├── layering.md
│   ├── dependencies.md
│   └── patterns.md
├── code-quality/
│   ├── naming.md
│   ├── complexity.md
│   └── testing.md
├── performance/
│   ├── optimization.md
│   ├── caching.md
│   └── monitoring.md
└── domain/
    ├── business-logic.md
    └── compliance.md
Boas Práticas para Rules
✅ DO:

Ser específico e mensurável
Documentar o "por quê" atrás de cada rule
Incluir exemplos de violações
Definir exceções claramente
Revisar regularmente

❌ DON'T:

Criar regras muito restritivas
Deixar ambiguidades
Misturar responsabilidades
Ignorar contexto de negócio
Manter rules desatualizadas
