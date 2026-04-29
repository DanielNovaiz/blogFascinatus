# Skill: Deployment

## Descrição
Gerencia deploy e CI/CD para o blogFascinatus na Vercel.

## Quando Usar
- Configurar deploy automático
- Resolver problemas de build
- Rollback de versões
- Otimizar performance de build

## Quando NÃO Usar
- Desenvolvimento local (use `npm run dev`)
- Testes manuais
- Configuração de DNS (use Vercel Dashboard)

## Plataforma
**Vercel** (recomendada para Next.js)
- Edge Network global
- Serverless Functions
- Preview deployments
- Analytics integrado

## Procedimento
1. Verificar build local
2. Configurar env vars na Vercel
3. Deploy em preview
4. Validar funcionalidades críticas
5. Promover para produção

## Checklist Pre-Deploy

### Build
```bash
npm run build
npm run type-check
```
- [ ] Zero erros TypeScript
- [ ] Build completo sem falhas
- [ ] Bundle size aceitável (<500KB)

### Variáveis de Ambiente
```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```
- [ ] Todas configuradas na Vercel
- [ ] Valores diferentes por environment
- [ ] Secrets em "Encrypted"

### Funcionalidades Críticas
- [ ] Listagem de produtos
- [ ] Carrinho (localStorage)
- [ ] Checkout com Stripe
- [ ] Webhook de confirmação
- [ ] Login admin

## Configuração vercel.json
```json
{
  "functions": {
    "app/api/webhook/route.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Rollback
```bash
# Via CLI
vercel --version <previous>

# Ou via Dashboard
# Production > Deployments > Previous > Promote
```

## Integração com Rules
- security-rules
- performance-rules

## Version
1.0.0 - 2024-04
