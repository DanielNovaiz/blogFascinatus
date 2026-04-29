# Admin CRUD do blogFascinatus

## Visão Geral

Painel admin completo para gerenciar:
- ✅ Produtos (CRUD com upload de imagens)
- ✅ Posts (CRUD com markdown)
- ✅ Pedidos (status management)

## Arquitetura

### Server Actions (`lib/actions/`)

Toda lógica de banco de dados usa **Next.js Server Actions** (sem API routes):

```typescript
// Exemplo: lib/actions/products.ts
'use server';

export async function createProduct(formData: FormData) {
  // Validação com Zod
  // Inserir no Supabase
  // Revalidate cache
  // Retornar resultado
}
```

### Validação

Usa **Zod** para validação no servidor:

```typescript
const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  // ...
});
```

### Upload de Imagens

Usa **Supabase Storage** (buckets públicos):
- `products/` - Imagens de produtos
- `posts/` - Cover images de posts

```typescript
const { data } = await supabase.storage
  .from('products')
  .upload(path, file);
```

## Produtos (/admin/produtos)

### Funcionalidades

- **Tabela:** Mostra todos produtos (ativos + inativos)
- **Criar:** Novo produto com formulário
- **Editar:** Clique em "Editar" na linha
- **Deletar:** Clique em "Deletar" (com confirmação)
- **Upload:** Arraste imagens ou clique para selecionar

### Campos

| Campo | Tipo | Validação |
|-------|------|-----------|
| `name` | string | Obrigatório (max 255) |
| `description` | string | Opcional |
| `price` | number | Positivo, com decimais |
| `stock` | number | Inteiro >= 0 |
| `category` | string | Obrigatório |
| `active` | boolean | Checkbox |
| `images` | array | URLs públicas do Storage |

### Fluxo de Upload

1. Clique "Escolher arquivo" ou arraste imagem
2. File é enviado para Supabase Storage
3. URL pública é retornada e adicionada à lista
4. Ao salvar formulário, URLs são salvas no banco

### Exemplo de Uso

```
1. Novo Produto → Preenche formulário
2. Faz upload de 3 imagens
3. Clica "Salvar"
4. Produto criado com imagens no banco
5. Tabela atualiza automaticamente
```

## Posts (/admin/posts)

### Funcionalidades

- **Tabela:** Mostra todos posts (publicados + rascunhos)
- **Criar/Editar:** Formulário com preview em tempo real
- **Markdown:** Textarea com suporte a markdown
- **Preview:** Renderização ao lado do editor
- **Cover Image:** Upload de imagem de capa

### Campos

| Campo | Tipo | Validação |
|-------|------|-----------|
| `title` | string | Obrigatório (max 255) |
| `slug` | string | Auto-gerado ou manual (unique) |
| `content` | string | Markdown obrigatório |
| `cover_image` | string | URL opcional |
| `published` | boolean | Checkbox (rascunho vs publicado) |

### Auto-geração de Slug

Ao digitar o título, o slug é gerado automaticamente:

```
Título: "Meu Primeiro Post"
Slug:   "meu-primeiro-post"
```

### Preview de Markdown

Preview renderiza ao lado do editor em tempo real:
- `# Título` → `<h1>`
- `## Subtítulo` → `<h2>`
- `**negrito**` → `<strong>`
- `- item` → `<li>`

**Nota:** Preview é simples (sem regex complexo). Para renderização full markdown no front, use marked.js via CDN no cliente.

## Pedidos (/admin/pedidos)

### Funcionalidades

- **Tabela read-only:** Mostra todos pedidos
- **Filtro:** Por status (Todos, Pendente, Pago, Enviado, Entregue)
- **Status Management:** Botão "Avançar" para mudar status

### Status Flow

```
Pendente → Pago → Enviado → Entregue
  ↓
Clique em "Avançar" para mudar de status
```

### Campos Exibidos

| Campo | Tipo |
|-------|------|
| `id` | UUID (primeiros 8 chars) |
| `customer_email` | Email |
| `items` | Número de itens |
| `total` | Valor formatado (R$) |
| `status` | Badge colorido |
| `created_at` | Data formatada |

### Restrições

- ❌ Não pode editar valores (price, quantity)
- ❌ Não pode deletar pedido
- ✅ Pode avançar status: pending → paid → shipped → done

## Setup no Supabase

### 1. Criar Buckets Storage

```sql
-- Via Supabase Dashboard > Storage

-- Bucket: products (público)
-- Folder: produtos/{id}/imagens

-- Bucket: posts (público)
-- Folder: posts/{id}/cover
```

### 2. Configurar RLS (Storage)

```sql
-- Qualquer um pode ler
-- Apenas service_role pode escrever
```

### 3. Tabela `admins`

Verifique se existe (deve ter sido criada pelo SQL de setup):

```sql
SELECT * FROM public.admins WHERE user_id = auth.uid();
```

## Segurança

### ✅ Implementado

- Validação em **todos** Server Actions (Zod)
- Service role key **nunca** exposto ao client
- Upload direto ao Storage (sem exposição de credenciais)
- Revalidação de cache após mudanças (ISR)
- RLS nas tabelas (mesmo no admin, respeitamos RLS)

### 🔒 Tipos de Validação

```typescript
// 1. Zod no servidor
const schema = z.object({ ... });
schema.safeParse(data);

// 2. Supabase RLS
// Só service_role consegue escrever em algumas tabelas

// 3. Autenticação (middleware)
// Apenas usuários autenticados acessam /admin/*
```

## Erros Comuns

### "Storage bucket não existe"

- Vá a Storage > New Bucket
- Nome: `products` ou `posts`
- Acesso: Public
- Clique Create

### "Erro ao fazer upload"

- Verifique ANON_KEY em `.env.local`
- Verifique se bucket é público
- Tente criar bucket novamente

### "Não consigo editar produto"

- Verifique se está logado (session cookie)
- Verifique se existe admin user no banco
- Limpe cookies do navegador e faça login novamente

## Desenvolvimento

### Adicionar Novo Campo

1. Update schema do Supabase (SQL)
2. Update Zod schema em `lib/actions/schemas.ts`
3. Add input no formulário (página admin)
4. Add coluna na tabela (se necessário)

### Exemplo: Adicionar campo "descricao_curta"

```typescript
// 1. SQL
ALTER TABLE products ADD COLUMN short_description TEXT;

// 2. Zod
const CreateProductSchema = z.object({
  // ...
  short_description: z.string().max(100).optional(),
});

// 3. Form
<input name="short_description" maxLength={100} />

// 4. Tabela (opcional)
<td>{product.short_description}</td>
```

## Próximas Melhorias

- [ ] Paginação na tabela de produtos/posts
- [ ] Busca/filtro por nome
- [ ] Bulk delete
- [ ] Exportar pedidos (CSV)
- [ ] Integração com Stripe webhook para pedidos
- [ ] Preview de cover_image em tempo real
- [ ] Drag-drop para reordenar imagens
