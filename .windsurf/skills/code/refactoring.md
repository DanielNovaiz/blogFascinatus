# Skill: Code Refactoring

## Descrição
Melhora qualidade do código existente mantendo comportamento.

## Quando Usar
- Código duplicado identificado
- Funções muito longas (>50 linhas)
- Componentes complexos demais
- Deveda técnica acumulada
- Migrar para novos padrões

## Quando NÃO Usar
- Código funcional sem problemas
- Alterar comportamento (nova feature)
- Corrigir bugs (use debug skill)
- Apenas renomear (use style-rules)

## Procedimento
1. Identificar code smells
2. Garantir testes de cobertura
3. Aplicar refactoring incremental
4. Validar após cada mudança
5. Documentar mudanças

## Padrões de Refactoring

### Extrair Componente
```tsx
// Antes
export default function Page() {
  return (
    <div>
      <div className="complex-card">
        {/* 50+ linhas */}
      </div>
    </div>
  );
}

// Depois
import { ProductCard } from '@/components/ProductCard';

export default function Page() {
  return (
    <div>
      <ProductCard product={product} />
    </div>
  );
}
```

### Extrair Hook
```tsx
// Antes
export default function Component() {
  const [data, setData] = useState();
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  // ...
}

// Depois
function useData() {
  const [data, setData] = useState();
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  return data;
}

export default function Component() {
  const data = useData();
  // ...
}
```

### Simplificar Condicionais
```tsx
// Antes
if (condition1) {
  if (condition2) {
    return result;
  }
}

// Depois
if (!condition1 || !condition2) return null;
return result;
```

## Integração com Rules
- architecture-rules
- performance-rules
- style-rules

## Version
1.0.0 - 2024-04
