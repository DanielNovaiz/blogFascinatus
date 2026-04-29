# Windsurf Configuration - blogFascinatus

Configuração de skills, rules e workflows para o projeto blogFascinatus.

## 📁 Estrutura

```
.windsurf/
├── skills/           # Capacidades do Cascade
│   ├── code/         # Desenvolvimento
│   ├── reasoning/    # Análise e decisão
│   └── integration/  # Deploy e integração
├── rules/            # Padrões e restrições
│   ├── security.md   # Segurança
│   ├── performance.md  # Performance
│   ├── architecture.md   # Arquitetura
│   └── style.md        # Estilo de código
└── workflows/        # Automações
    ├── feature-dev.yaml
    ├── bug-fix.yaml
    └── release.yaml
```

## 🚀 Como Usar

### Workflows

**Desenvolver nova feature:**
```
/feature Criar sistema de avaliações de produtos
```

**Corrigir bug:**
```
/bugfix Carrinho não persiste após refresh
```

**Fazer release:**
```
/release
```

### Skills

As skills são ativadas automaticamente quando relevantes:
- `code-generation`: Ao criar novos arquivos
- `refactoring`: Ao melhorar código existente
- `testing`: Ao criar testes
- `architectural-analysis`: Ao decidir abordagens
- `deployment`: Ao fazer deploy

### Rules

As rules são sempre aplicadas:
- **security**: Validação de RLS, secrets, webhooks
- **performance**: Limites de bundle, queries, LCP
- **architecture**: Estrutura de pastas, Server/Client components
- **style**: Formatação, naming, Tailwind patterns

## 🎨 Contexto do Projeto

**blogFascinatus**: Blog + Loja de produtos artesanais
- Next.js 15 (App Router)
- React 19 + Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)
- Stripe (pagamentos)
- Paleta: ivory, beige, earth, peach, lilac, mint, forest

## 📋 Checklist de Desenvolvimento

- [ ] Seguir `architecture-rules` (Server Components preferidos)
- [ ] Usar paleta de cores customizada (não gray/blue)
- [ ] Implementar validação Zod em Server Actions
- [ ] Testar RLS em novas tabelas
- [ ] Verificar performance (LCP < 2.5s)
- [ ] Documentar mudanças em ADMIN.md se afetar admin

## 🔐 Segurança

- Secrets apenas em Server Components/Actions
- Nunca commitar .env.local
- Webhooks Stripe sempre validar assinatura
- RLS obrigatório em todas as tabelas

## 📈 Performance Targets

- Bundle: < 200KB gzipped
- API p95: < 300ms
- LCP: < 2.5s
- CLS: < 0.1

---

Baseado no guia: `cascade-instrutions`
