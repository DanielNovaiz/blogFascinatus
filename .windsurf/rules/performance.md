# Performance Rules - blogFascinatus

## Descrição
Define limites e otimizações para manter aplicação rápida e responsiva.

## Aplicabilidade
- Frontend (Next.js + React)
- APIs e Server Actions
- Database queries
- Assets (imagens, fonts)

## Targets

### Frontend
```
TTFB: < 200ms
FCP: < 1.0s
LCP: < 2.5s
TTI: < 3.8s
CLS: < 0.1
Bundle: < 200KB (gzipped)
```

### APIs
```
p50: < 100ms
p95: < 300ms
p99: < 500ms
```

### Database
```
Queries: < 50ms (simples)
Queries: < 200ms (complexas com JOIN)
N+1: Proibido
```

## Regras Específicas

### 1. Imagens
```
✅ Usar next/image (otimização automática)
✅ lazy loading para imagens abaixo da dobra
✅ WebP/AVIF quando suportado
✅ Placeholders blur para LCP
```

**Implementação**:
```tsx
import Image from 'next/image';

<Image
  src="/produto.jpg"
  alt="Produto"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  loading="lazy" // default para fora da viewport
/>
```

### 2. Fontes
```
✅ next/font (otimização automática)
✅ font-display: swap
✅ Preload para fontes críticas
```

### 3. Data Fetching
```
✅ Server Components quando possível
✅ parallel fetching (Promise.all)
✅ Caching agressivo (revalidate)
✅ Streaming com Suspense
```

**Exemplo**:
```tsx
// ✅ Paralelo
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories()
]);

// ❌ Sequencial (mais lento)
const products = await getProducts();
const categories = await getCategories();
```

### 4. Server Actions
```
✅ Retornar apenas dados necessários
✅ Evitar N+1 com .in() ou joins
✅ Usar cache: 'no-store' para dados real-time
```

### 5. Bundle Optimization
```
✅ Code splitting automático (Next.js)
✅ Dynamic imports para componentes pesados
✅ Tree shaking (evitar barrel imports grandes)
```

**Dynamic import**:
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

## Medição

### Local
```bash
npm run build
# Analisar output do bundle
```

### Lighthouse CI
```bash
npx lighthouse-ci http://localhost:3000
```

### Vercel Analytics
- Ativar no dashboard
- Monitorar Web Vitals

## Exceções
- Dashboard admin: até 500KB (muitos componentes ricos)
- Relatórios pesados: sem limite (rodam em background)
- Imagens de produto: qualidade优先

## Version
1.0.0 - 2024-04
