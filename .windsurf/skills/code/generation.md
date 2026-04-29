# Skill: Code Generation

## Descrição
Gera código novo para o blogFascinatus baseado em requisitos específicos.

## Quando Usar
- Novos componentes React
- Novas páginas Next.js
- APIs e Server Actions
- Tipos TypeScript
- Testes automatizados

## Quando NÃO Usar
- Refactoring de código existente (use refactoring skill)
- Correção de bugs (use debug skill)
- Apenas mudanças de estilo visual

## Contexto do Projeto
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **Banco**: Supabase (PostgreSQL)
- **Pagamento**: Stripe
- **Estilo**: Paleta terrosa (ivory, beige, earth, peach, lilac, mint, forest)

## Procedimento
1. Analisar requisitos e contexto
2. Identificar padrões existentes no projeto
3. Gerar código seguindo conventions do projeto:
   - Componentes: arrow functions com export default
   - Server Actions: 'use server' no topo
   - Client Components: 'use client' quando necessário
   - Cores: usar paleta customizada (não gray/blue padrão)
4. Validar TypeScript
5. Verificar consistência com código existente

## Padrões do blogFascinatus

### Componentes
```tsx
interface Props {
  // props tipadas
}

export default function ComponentName({ prop }: Props) {
  return (
    <div className="bg-ivory-50 border border-beige-200">
      {/* conteúdo */}
    </div>
  );
}
```

### Server Actions
```ts
'use server';

import { supabase } from '@/lib/supabase';

export async function actionName(formData: FormData) {
  // validação com Zod
  // operação no banco
  // retorno padronizado
}
```

## Integração com Rules
- style-rules
- architecture-rules
- security-rules

## Exemplo

### Input
```
Criar componente de avaliação de produtos com estrelas
```

### Output
```tsx
// components/ProductRating.tsx
'use client';

import { useState } from 'react';

interface Props {
  productId: string;
  initialRating?: number;
  readonly?: boolean;
}

export default function ProductRating({ productId, initialRating = 0, readonly = false }: Props) {
  const [rating, setRating] = useState(initialRating);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={readonly}
          onClick={() => !readonly && setRating(star)}
          className={`w-5 h-5 ${star <= rating ? 'text-peach-500' : 'text-beige-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

## Version
1.0.0 - 2024-04
