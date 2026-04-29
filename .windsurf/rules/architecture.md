# Architecture Rules - blogFascinatus

## Descrição
Padrões estruturais para manter código organizado e escalável.

## Estrutura de Pastas

```
app/
├── page.tsx              # Home (Server Component)
├── layout.tsx            # Root layout
├── globals.css           # Tailwind + variáveis CSS
├── actions/              # Server Actions
│   ├── products.ts
│   └── orders.ts
├── admin/                # Admin routes (protegidas)
│   ├── layout.tsx        # Admin layout
│   ├── page.tsx          # Dashboard
│   ├── produtos/
│   └── pedidos/
├── api/                  # API routes
│   └── webhook/
├── blog/                 # Blog routes
├── checkout/             # Checkout flow
├── produtos/             # Loja
components/
├── ProductCard.tsx       # Componentes reutilizáveis
├── PostCard.tsx
├── CartDrawer.tsx
├── AddToCartButton.tsx
lib/
├── supabase.ts           # Client Supabase
├── stripe.ts             # Client Stripe
├── utils.ts              # Helpers
hooks/
├── use-cart.ts           # Custom hooks
└── use-auth.ts
types/
├── product.ts            # TypeScript interfaces
├── order.ts
└── post.ts
```

## Regras de Camadas

### 1. Server vs Client Components
```
Server Components (padrão):
- Busca de dados
- Acesso a API keys
- Lógica de negócio pesada

Client Components ('use client'):
- Interatividade (onClick, useState)
- Browser APIs (localStorage)
- Hooks do React (useEffect)
```

### 2. Data Flow
```
Client Component
    ↓
Server Action ('use server')
    ↓
Supabase/Stripe/External API
    ↓
Database/Payment Processor
```

### 3. Component Composition
```
✅ Composição sobre herança
✅ Props drilling máx 3 níveis
✅ Context apenas para global state (auth, cart)
```

**Exemplo**:
```tsx
// ❌ Evitar props drilling profundo
<Parent prop1={x} prop2={y} prop3={z}>
  <Child prop1={x} prop2={y}>
    <GrandChild prop1={x} />
  </Child>
</Parent>

// ✅ Composição ou Context
<Parent>
  <CartProvider>
    <Child />
  </CartProvider>
</Parent>
```

## Naming Conventions

### Arquivos
```
Components: PascalCase.tsx
Páginas: page.tsx (Next.js convention)
Layouts: layout.tsx
Actions: camelCase.ts
Utils: camelCase.ts
Types: PascalCase.ts
```

### Funções
```
Server Actions: verb + noun (createProduct)
Components: noun (ProductCard)
Hooks: use + noun (useCart)
Utils: verb (formatPrice)
```

## State Management

### Local State
```tsx
// useState para componente
const [isOpen, setIsOpen] = useState(false);
```

### Global State (Context)
```tsx
// CartProvider para carrinho
<CartProvider>
  {children}
</CartProvider>
```

### Server State
```tsx
// Fetch no Server Component
const products = await getProducts();
```

## Imports Ordenação
```tsx
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party
import { supabase } from '@supabase/supabase-js';

// 3. Internal (alias @/)
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/actions/products';

// 4. Types
import type { Product } from '@/types/product';

// 5. Styles
import styles from './ProductList.module.css';
```

## Version
1.0.0 - 2024-04
