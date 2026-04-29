<!--
Checklist de segurança para produção (Vercel)
- [ ] Todos os secrets em variáveis de ambiente da Vercel
- [ ] RLS habilitado e testado no Supabase
- [ ] Webhook Stripe com assinatura verificada
- [ ] Sem console.log com dados sensíveis
- [ ] Rate limit no login ativo
-->

# blogFascinatus

Blog + loja para vender produtos de beleza e cosméticos online.

**Stack:** Next.js 14 (App Router) | Supabase | Tailwind | Stripe | Vercel

## 🚀 Setup em 5 comandos

```bash
# 1. Clonar e entrar no projeto
git clone <repo-url> && cd blogFascinatus

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais (Supabase, Stripe)

# 4. Rodar em desenvolvimento
npm run dev

# 5. Abrir no navegador
# Acesse http://localhost:3000
```

## 📁 Estrutura de Pastas

```
blogFascinatus/
├── app/               # Next.js 14 App Router (rotas e layouts)
├── components/        # Componentes React reutilizáveis
├── lib/               # Funções utilitárias (Supabase, Stripe, helpers)
├── types/             # TypeScript types e interfaces
├── public/            # Assets estáticos
├── .env.example       # Variáveis de ambiente (template)
└── README.md          # Este arquivo
```

## 🔐 Princípios do Projeto

- **GSD 2.0:** Código funcional mínimo antes de estética
- **Segurança:** Secrets nunca expostos, inputs validados no servidor, RLS no Supabase
- **Autonomia:** Decisões de estrutura tomadas sem pedidos de permissão
- **Responsabilidade:** Cada decisão não óbvia é explicada

## 📝 Próximos Passos

- [ ] Configurar Supabase (schema do banco) ✅
- [ ] Criar páginas de catálogo (/produtos, /produtos/[slug]) ✅
- [ ] Criar páginas de blog (/blog, /blog/[slug]) ✅
- [ ] Configurar autenticação (Supabase Auth) ✅
- [ ] Painel admin CRUD (produtos, posts, pedidos) ✅
- [ ] Integrar carrinho de compras ✅
- [ ] Integrar Stripe para pagamentos
- [ ] Webhook de confirmação de pedidos
- [ ] Deploy na Vercel

## 🛒 Carrinho de Compras

Documentação completa em [CART.md](CART.md).

**Features:**
- ✅ Context API + useReducer (sem libs externas)
- ✅ Persistência localStorage
- ✅ Drawer deslizante
- ✅ Badge de quantidade
- ✅ Preços sempre do servidor (segurança)

**Rotas:**
- `/checkout` - Resumo e checkout
- `/checkout/sucesso` - Confirmação

## 🎯 Painel Admin

Documentação completa em [ADMIN.md](ADMIN.md).

**URLs:**
- Login: `http://localhost:3000/admin/login`
- Dashboard: `http://localhost:3000/admin`
- Produtos: `http://localhost:3000/admin/produtos`
- Posts: `http://localhost:3000/admin/posts`
- Pedidos: `http://localhost:3000/admin/pedidos`

**Features:**
- ✅ CRUD completo: produtos, posts
- ✅ Upload de imagens (Supabase Storage)
- ✅ Markdown editor com preview (posts)
- ✅ Gerenciamento de status (pedidos)
- ✅ Validação com Zod + Server Actions

### Setup no Supabase

1. Vá até **Authentication > Providers** no dashboard
2. Habilite **Email** (já deve estar)
3. Configure **Email/Password** como método de login
4. (Opcional) Configure confirmação de email se quiser

### Criar Usuário Admin

```bash
# Via Supabase Dashboard:
# 1. Vá para Authentication > Users
# 2. Clique "Add user"
# 3. Email: seu@email.com
# 4. Password: senha forte
# 5. Clique "Create User"
```

### URLs

- Login: `http://localhost:3000/admin/login`
- Dashboard: `http://localhost:3000/admin`
- Protegido: `/admin/*` (redireciona para login se não autenticado)
