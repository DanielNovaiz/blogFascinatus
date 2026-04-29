# Security Rules - blogFascinatus

## Descrição
Diretrizes de segurança para proteger dados e prevenir vulnerabilidades.

## Aplicabilidade
- Todas as Server Actions
- APIs de webhook
- Admin panel
- Integrações (Stripe, Supabase)

## Regras

### 1. Autenticação
```
✅ VERIFICAR: Server Actions protegidas
✅ VERIFICAR: RLS habilitado no Supabase
✅ VERIFICAR: Tokens nunca expostos no client
```

**Implementação**:
```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('supabase-auth-token');
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect('/admin/login');
  }
}
```

### 2. SQL Injection
```
✅ SEMPRE: Usar Supabase client (prepared statements)
❌ NUNCA: Concatenar strings em queries
```

**Exemplo seguro**:
```ts
// ✅ Correto
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId);  // Escapado automaticamente

// ❌ Errado
const query = `SELECT * FROM products WHERE id = '${productId}'`;
```

### 3. XSS Prevention
```
✅ Escapar inputs do usuário
✅ Sanitizar HTML (se necessário)
✅ CSP headers configurados
```

**Next.js automaticamente**:
- Escapa JSX por padrão
- `dangerouslySetInnerHTML` requer explícito

### 4. Secrets Management
```
✅ .env.local NUNCA commitado
✅ Secrets apenas em Server Components/Actions
✅ NEXT_PUBLIC_* apenas para valores não-sensíveis
```

**Estrutura .env**:
```bash
# Client-side (público)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only (privado)
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 5. Stripe Webhook Security
```ts
// ✅ Verificar assinatura
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);

// ❌ Nunca confiar no payload diretamente
```

### 6. Rate Limiting
```
✅ Login: max 5 tentativas/minuto
✅ Checkout: max 3 tentativas/hora
✅ API pública: implementar throttling
```

## Forbidden Patterns
```
❌ eval() ou new Function()
❌ innerHTML com user input
❌ LocalStorage para dados sensíveis
❌ Console.log de tokens/secrets
❌ CORS * em produção
```

## Checklist de Segurança
- [ ] RLS testado em todas as tabelas
- [ ] Webhooks validando assinatura
- [ ] Rate limiting ativo
- [ ] CSP headers configurados
- [ ] Secrets rotacionados regularmente
- [ ] Dependências atualizadas (`npm audit`)

## Version
1.0.0 - 2024-04
