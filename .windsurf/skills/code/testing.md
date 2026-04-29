# Skill: Testing

## Descrição
Cria e mantém testes automatizados para o blogFascinatus.

## Quando Usar
- Nova funcionalidade (TDD)
- Cobertura insuficiente (<70%)
- Regressões frequentes
- APIs críticas (checkout, pagamento)

## Quando NÃO Usar
- Testes de UI/E2E (use Playwright diretamente)
- Código descartável/protótipo
- Mock excessivo de dependências

## Stack de Testes
- **Unitário**: Vitest + React Testing Library
- **Integração**: Supabase test containers
- **E2E**: Playwright (separado)

## Procedimento
1. Identificar o que testar
2. Criar casos de sucesso
3. Criar casos de erro
4. Mockar dependências externas
5. Verificar cobertura

## Padrões de Teste

### Componente React
```tsx
// components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Produto Teste',
    price: 99.90,
    images: ['/test.jpg'],
    category: 'Categoria'
  };

  it('renderiza nome do produto', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
  });

  it('exibe preço formatado', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('R$ 99.90')).toBeInTheDocument();
  });
});
```

### Server Action
```tsx
// lib/actions/__tests__/products.test.ts
import { getProducts } from '../products';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

describe('getProducts', () => {
  it('retorna produtos ativos', async () => {
    const result = await getProducts();
    expect(supabase.from).toHaveBeenCalledWith('products');
  });
});
```

## Integração com Rules
- testing-rules
- security-rules

## Version
1.0.0 - 2024-04
