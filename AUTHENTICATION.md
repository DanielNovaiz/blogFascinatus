# Autenticação no blogFascinatus

## Visão Geral

Autenticação implementada com **Supabase Auth** usando email + senha.

- ✅ Login por email + senha
- ✅ Middleware que protege `/admin/*`
- ✅ Rate limiting (5 tentativas por IP em 15min)
- ✅ Sessions via cookies (SSR pattern)
- ✅ Segurança: sem exposição de service_role key

## Arquitetura

### Middleware (`middleware.ts`)

```
Requisição para /admin/*
    ↓
Verifica se autenticado (via cookie de sessão)
    ↓
Não? → Redireciona para /admin/login
Sim? → Continua normalmente
```

**Rate Limiting:** Máximo 5 tentativas de login por IP em 15 minutos. Usa Map em memória (simples, sem Redis).

### Clientes Supabase

- **Server-side** (`lib/auth-utils.ts`): `createServerClient()` 
  - Usa cookies do `next/headers`
  - Seguro: pode acessar sem risco

- **Client-side** (`lib/auth-utils.ts`): `createBrowserClient()`
  - Para componentes Client
  - Usa ANON_KEY (nunca service_role)

## Fluxo de Login

1. Usuário acessa `/admin/login`
2. Formulário (`app/admin/login/page.tsx`):
   - Input: email + senha
   - Enviar para `supabase.auth.signInWithPassword()`
   - Se sucesso → Redireciona para `/admin`
   - Se erro → Mostra mensagem

## Proteção de Rotas

Todas rotas em `/admin/*` são protegidas:

```
/admin              ← Protegido
/admin/produtos     ← Protegido
/admin/posts        ← Protegido
/admin/pedidos      ← Protegido
/admin/login        ← NÃO protegido (acesso público)
```

## Layout Admin (`app/admin/layout.tsx`)

Sidebar com:
- Email do usuário autenticado
- Links: Dashboard, Produtos, Posts, Pedidos
- Botão "Sair"

```
┌─────────────────────────────────────┐
│ Sidebar         │ Main Content      │
│                 │                   │
│ Dashboard       │                   │
│ Produtos        │                   │
│ Posts           │                   │
│ Pedidos          │                   │
│ [Sair]          │                   │
└─────────────────────────────────────┘
```

## Setup

### 1. Instalar Dependência

```bash
npm install @supabase/ssr
```

### 2. Configurar Supabase Dashboard

1. Vá para **Authentication > Providers**
2. Habilite **Email/Password**
3. Configure **Email Settings** (confirmação, templates)

### 3. Criar Primeiro Admin

No dashboard Supabase > **Authentication > Users**:
- Clique **"Add user"**
- Email: seu@email.com
- Password: senha forte
- Clique **"Create User"**

### 4. Testar Login

```bash
npm run dev
# Acesse http://localhost:3000/admin/login
# Use email + senha criados acima
```

## Segurança

### ✅ Implementado

- Service role key **NUNCA** exposto ao client
- Rate limiting por IP (5 tentativas/15min)
- Cookies HTTP-only para sessão
- Redirects automáticos para login se não autenticado
- Inputs validados pelo Supabase

### 🔄 Próximas Melhorias (opcional)

- [ ] Refresh token rotation
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] OAuth (Google, GitHub)
- [ ] Rate limiting com Redis (em produção)

## Debugging

### "Erro ao conectar"

- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão em `.env.local`
- Verifique cookies do navegador (DevTools > Application > Cookies)

### Middleware não funciona

- Certifique-se que `middleware.ts` está na **raiz do projeto** (não em `app/`)
- Limpe `.next/` e rode novamente: `rm -rf .next && npm run dev`

### Taxa de login bloqueada

Rate limiting é por IP. Se bloqueado, aguarde 15 minutos ou reinicie o servidor (Map em memória é resetado).

## Referências

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Pattern](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
