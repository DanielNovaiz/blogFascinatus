# Carrinho de Compras - blogFascinatus

## Visão Geral

Carrinho totalmente funcional com:
- ✅ Context API + useReducer (sem libs externas)
- ✅ Persistência no localStorage
- ✅ Drawer deslizante da direita
- ✅ Badge de quantidade no header
- ✅ Segurança: preço sempre consultado no servidor

## Arquitetura

### Estado do Carrinho

```typescript
interface CartItem {
  productId: string;
  qty: number;
}

// Nunca armazena preço no cliente!
```

**Por quê?** Alguém poderia modificar o localStorage para alterar preços. Sempre consultamos o preço real no servidor na hora do checkout.

### Context + useReducer

```typescript
// lib/cart-context.ts
export const CartContext = createContext<CartContextType>();

// components/CartProvider.tsx
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  
  const addItem = (productId, qty) => {
    dispatch({ type: 'ADD_ITEM', payload: { productId, qty } });
  };
  // ...
}
```

### Persistência

```typescript
// Salva ao localStorage quando items mudam
useEffect(() => {
  localStorage.setItem('blogFascinatus_cart', JSON.stringify(items));
}, [items]);

// Carrega ao montar
useEffect(() => {
  const stored = localStorage.getItem('blogFascinatus_cart');
  if (stored) dispatch({ type: 'LOAD_FROM_STORAGE', payload: JSON.parse(stored) });
}, []);
```

## Componentes

### CartProvider

Wrapper que fornece contexto do carrinho.

```tsx
<CartProvider>
  <YourApp />
</CartProvider>
```

**Responsabilidades:**
- Gerencia estado com useReducer
- Sincroniza com localStorage
- Expõe métodos: addItem, removeItem, updateQty, clearCart

### useCart Hook

Hook customizado para acessar o contexto.

```typescript
const { items, addItem, removeItem, updateQty, clearCart, itemCount } = useCart();
```

### CartDrawer

Componente que desliza da direita.

```tsx
<CartDrawer />
```

**Features:**
- Toggle com botão no header
- Mostra lista de itens (com imagens)
- Controles de quantidade (−/+)
- Botão "Remover" por item
- Total calculado em tempo real
- Botão "Finalizar Compra" → `/checkout`
- Botão "Limpar Carrinho"

**Importante:** Produtos são carregados do servidor ao abrir o drawer para garantir preços atualizados!

### AddToCartButton

Botão reutilizável para adicionar produtos ao carrinho.

```tsx
<AddToCartButton productId={product.id} stock={product.stock} />
```

**Features:**
- Input de quantidade (−/+ com validação de stock)
- Feedback visual ao adicionar ("✓ Adicionado ao carrinho")
- Desabilitado se fora de estoque

## Fluxo de Compra

```
1. Usuario navega em /produtos
   ↓
2. Clica em "Adicionar ao Carrinho"
   → Produto adicionado ao localStorage
   → Badge atualiza
   ↓
3. Abre drawer clicando no ícone carrinho
   → Produtos carregados do servidor (preços reais)
   ↓
4. Clica "Finalizar Compra"
   → Vai para /checkout
   ↓
5. Em /checkout:
   → Carrega produtos do servidor NOVAMENTE
   → Valida stock
   → Valida preços
   → Cria pedido no banco
   → Redireciona para /checkout/sucesso
```

## Segurança

### ✅ Nunca Confie no Cliente

```typescript
// ❌ ERRADO: usar preço do localStorage
const total = cartItems.reduce((sum, item) => sum + item.priceInCart * item.qty, 0);

// ✅ CORRETO: buscar do servidor
const products = await supabase
  .from('products')
  .select('id, price')
  .in('id', cartItemIds);

const total = products.reduce((sum, product) => {
  const qty = cartItems.find(i => i.productId === product.id).qty;
  return sum + product.price * qty;
}, 0);
```

### Validações no Checkout

```typescript
// Valida stock
if (cartItem.qty > product.stock) {
  throw new Error(`Apenas ${product.stock} em estoque`);
}

// Valida produto ainda ativo
if (!product.active) {
  throw new Error('Produto não está mais disponível');
}
```

## localStorage Format

```json
{
  "blogFascinatus_cart": [
    { "productId": "550e8400-e29b-41d4-a716-446655440000", "qty": 2 },
    { "productId": "660f8500-e40c-51d5-b817-557766551111", "qty": 1 }
  ]
}
```

## Rotas Importantes

| Rota | Descrição |
|------|-----------|
| `/produtos` | Listagem de produtos |
| `/produtos/[slug]` | Detalhe + AddToCartButton |
| `/checkout` | Resumo + preços do servidor |
| `/checkout/sucesso` | Confirmação de pedido |

## Setup

### 1. Envolver app com CartProvider

```tsx
// app/layout.tsx
import { CartProvider } from '@/components/CartProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

### 2. Adicionar CartDrawer ao header

```tsx
// app/layout.tsx
<nav>
  <div className="flex justify-between">
    <a href="/">Logo</a>
    <CartDrawer />
  </div>
</nav>
```

### 3. Usar AddToCartButton em produtos

```tsx
// app/produtos/[slug]/page.tsx
<AddToCartButton productId={product.id} stock={product.stock} />
```

## Exemplo de Uso

### Acessar carrinho em qualquer componente

```tsx
'use client';

import { useCart } from '@/lib/use-cart';

export function MyComponent() {
  const { items, addItem, itemCount } = useCart();
  
  return (
    <div>
      Itens: {itemCount}
      <button onClick={() => addItem('product-123', 1)}>
        Adicionar
      </button>
    </div>
  );
}
```

## Actions do Carrinho

### addItem(productId, qty)

```typescript
addItem('550e8400...', 2);
// Adiciona 2 unidades do produto
// Se já existe, aumenta a quantidade
```

### removeItem(productId)

```typescript
removeItem('550e8400...');
// Remove o produto do carrinho
```

### updateQty(productId, qty)

```typescript
updateQty('550e8400...', 5);
// Define a quantidade para 5
// Se qty === 0, remove o item
```

### clearCart()

```typescript
clearCart();
// Limpa todos os itens
```

## localStorage Behavior

| Evento | Comportamento |
|--------|---------------|
| Abrir site | Carrega carrinho do localStorage |
| Adicionar produto | Salva no localStorage |
| Remover produto | Salva no localStorage |
| Limpar carrinho | Apaga do localStorage |
| Fechar aba | localStorage persiste |
| Limpar dados do navegador | localStorage apagado |

## Debugging

### Ver conteúdo do carrinho

```javascript
// DevTools Console
JSON.parse(localStorage.getItem('blogFascinatus_cart'));
```

### Limpar carrinho manualmente

```javascript
localStorage.removeItem('blogFascinatus_cart');
location.reload();
```

## Próximas Melhorias

- [ ] Integração com Stripe Payment
- [ ] Cupons de desconto
- [ ] Histórico de carrinho (salvar carrinho antigos)
- [ ] Sugestões de produtos relacionados
- [ ] Carrinho compartilhável (via URL)
- [ ] Analytics de abandono de carrinho
