# Skill: Architectural Analysis

## Descrição
Analisa decisões arquiteturais e sugere melhorias para o blogFascinatus.

## Quando Usar
- Nova funcionalidade complexa
- Dúvida entre abordagens
- Avaliação de débito técnico
- Planejamento de roadmap

## Quando NÃO Usar
- Decisões puramente visuais
- Escolha de cores/fonts
- Problemas simples com solução óbvia

## Contexto Arquitetural

### Stack blogFascinatus
```
Frontend: Next.js 15 + React 19 + Tailwind
Backend: Next.js API Routes + Server Actions
Database: Supabase (PostgreSQL + RLS)
Auth: Supabase Auth
Payments: Stripe
Storage: Supabase Storage
```

### Padrões Arquiteturais
- **App Router**: Server Components por padrão
- **Data Fetching**: Server Actions para mutações
- **State**: React Context para global, useState para local
- **Styling**: Tailwind com paleta customizada

## Procedimento de Análise
1. Entender requisitos funcionais
2. Mapear fluxos de dados
3. Identificar pontos de integração
4. Avaliar trade-offs
5. Recomendar abordagem

## Framework de Decisão

### CRUD Simples
**Recomendação**: Server Actions + Server Components
- Listagem: Server Component com fetch
- Mutações: Server Actions
- Cache: revalidateTag

### Fluxos Complexos (Checkout)
**Recomendação**: Híbrido
- Server Component: Resumo do pedido
- Client Component: Formulário Stripe
- Server Action: Criar PaymentIntent

### Dashboard Admin
**Recomendação**: Client Components
- Rich interactivity
- Real-time updates (Supabase realtime)
- Forms complexos

## Trade-offs Comuns

| Aspecto | Server Components | Client Components |
|---------|-------------------|-------------------|
| Performance | Melhor (menos JS) | Mais JS no bundle |
| SEO | Excelente | Requer configuração |
| Interatividade | Limitada | Total |
| Acesso a APIs | Direto | Via fetch/Server Actions |

## Integração com Rules
- architecture-rules
- performance-rules

## Version
1.0.0 - 2024-04
