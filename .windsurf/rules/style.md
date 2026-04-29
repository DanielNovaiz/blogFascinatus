# Style Rules - blogFascinatus

## Descrição
Consistência de código e formatação para TypeScript/React.

## Formatação

### Indentação
```
2 espaços (não tabs)
Sem trailing whitespace
Final de arquivo com newline
```

### Linha
```
Máximo: 100 caracteres
Imports: uma linha por import
```

### Imports
```
Ordem: React > Third-party > Internal > Types > Styles
Agrupar: imports do mesmo módulo juntos
Nunca: import * (exceto types)
```

## Naming

### Variáveis
```ts
// camelCase
const productList = [];
const isLoading = false;

// Booleanos: prefixo is/has/should
const isVisible = true;
const hasError = false;
```

### Funções
```ts
// camelCase, verbo + substantivo
function getProductById(id: string) {}
function handleClick() {}
function formatPrice(price: number) {}

// React: handler prefix
onClick={handleSubmit}
onChange={handleInputChange}
```

### Componentes
```tsx
// PascalCase
export default function ProductCard() {}

// Props interface
interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}
```

### Types/Interfaces
```ts
// PascalCase
interface Product {
  id: string;
  name: string;
}

type OrderStatus = 'pending' | 'paid' | 'shipped';

// Enum (evitar, usar const assertion)
const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
} as const;
```

## React Patterns

### Componentes
```tsx
// Arrow function (consistente)
export default function Component({ prop }: Props) {
  return <div />;
}

// Destructuring nas props
function ProductCard({ product, onClick }: ProductCardProps) {
  const { name, price } = product;
  return <div />;
}

// Early return para loading/error
function ProductList() {
  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <div />;
}
```

### Hooks
```tsx
// Ordem: useState > useEffect > custom hooks
function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProduct(id).then(data => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);
  
  return { product, loading };
}
```

### Conditional Rendering
```tsx
// ✅ Simples
{isVisible && <Component />}

// ✅ Ternário para dois casos
{isAdmin ? <AdminPanel /> : <UserView />}

// ❌ Nested ternários (difícil de ler)
{isA ? (isB ? <C /> : <D />) : <E />}
```

## Tailwind Patterns

### Ordem de Classes
```
1. Layout (display, position)
2. Box Model (w, h, m, p)
3. Visual (bg, border, shadow)
4. Typography (text, font)
5. Interactive (hover, focus)
```

**Exemplo**:
```tsx
<div className="
  flex items-center justify-between
  w-full h-12 px-4 py-2
  bg-ivory-50 border border-beige-200 rounded-xl
  text-earth-800 font-medium
  hover:bg-beige-100 hover:border-peach-200
  transition-colors duration-200
" />
```

### Custom Classes
```
✅ Usar paleta customizada (ivory, beige, earth, etc.)
❌ Evitar gray-*, blue-*, green-* padrões
```

### Componentes Reutilizáveis
```tsx
// Criar componente ao invés de repetir classes
const Button = ({ variant, children }) => {
  const variants = {
    primary: 'bg-peach-600 text-white',
    secondary: 'border border-beige-300 text-earth-700'
  };
  return <button className={variants[variant]}>{children}</button>;
};
```

## TypeScript

### Tipos Explícitos
```ts
// ✅ Sempre tipar retorno de funções públicas
export function getProduct(id: string): Promise<Product | null> {}

// ✅ Tipar props de componentes
interface Props {
  product: Product;
}

// ❌ Evitar any
function bad(product: any) {}
```

### Null Safety
```ts
// ✅ Optional chaining
const name = product?.name;

// ✅ Nullish coalescing
const price = product?.price ?? 0;

// ❌ Non-null assertion (evitar)
const name = product!.name;
```

## Version
1.0.0 - 2024-04
