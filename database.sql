-- blogFascinatus Schema SQL para Supabase
-- Executar tudo de uma vez no SQL Editor do Supabase

-- ============================================================================
-- 1. TABELA: PRODUCTS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT ARRAY[]::TEXT[], -- array de URLs de imagens
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  embedding vector(1536), -- pgvector para busca semântica
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca e filtro
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_slug ON public.products USING GIN (
  to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
); -- busca full-text

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX idx_products_embedding ON public.products USING ivfflat (
  embedding vector_cosine_ops
) WITH (lists = 100); -- similaridade por cosseno

-- RLS: Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler produtos ativos
CREATE POLICY "Produtos ativos são públicos"
  ON public.products
  FOR SELECT
  USING (active = true);

-- Apenas service_role pode escrever/editar/deletar (será feito via admin API)
CREATE POLICY "Apenas admin pode escrever produtos"
  ON public.products
  FOR INSERT
  WITH CHECK (false); -- bloqueado por padrão, service_role ignora RLS

CREATE POLICY "Apenas admin pode editar produtos"
  ON public.products
  FOR UPDATE
  WITH CHECK (false);

CREATE POLICY "Apenas admin pode deletar produtos"
  ON public.products
  FOR DELETE
  USING (false);


-- ============================================================================
-- 2. FUNÇÕES E EXTENSÕES PARA BUSCA SEMÂNTICA
-- ============================================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price DECIMAL(10, 2),
  images TEXT[],
  category TEXT,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.price,
    p.images,
    p.category,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM public.products p
  WHERE p.active = true
    AND p.embedding IS NOT NULL
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;


-- ============================================================================
-- 3. TABELA: POSTS
-- ============================================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, -- markdown
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_published ON public.posts(published);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_search ON public.posts USING GIN (
  to_tsvector('portuguese', title || ' ' || content)
);

-- RLS: Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler posts publicados
CREATE POLICY "Posts publicados são públicos"
  ON public.posts
  FOR SELECT
  USING (published = true);

-- Apenas service_role pode escrever
CREATE POLICY "Apenas admin pode escrever posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Apenas admin pode editar posts"
  ON public.posts
  FOR UPDATE
  WITH CHECK (false);

CREATE POLICY "Apenas admin pode deletar posts"
  ON public.posts
  FOR DELETE
  USING (false);


-- ============================================================================
-- 4. TABELA: ORDERS
-- ============================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB, -- [{product_id, quantity, price_at_purchase}]
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'done')),
  stripe_payment_id TEXT UNIQUE, -- ID da sessão/intent do Stripe
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca e filtro
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_stripe_payment_id ON public.orders(stripe_payment_id);

-- RLS: Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado pode ver apenas suas próprias orders
CREATE POLICY "Usuário vê suas próprias orders"
  ON public.orders
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email' OR auth.role() = 'service_role');

-- Usuário autenticado pode criar order
CREATE POLICY "Usuário autenticado pode criar order"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    customer_email = auth.jwt() ->> 'email'
    AND auth.role() = 'authenticated'
  );

-- Apenas service_role pode atualizar (webhook do Stripe)
CREATE POLICY "Apenas service_role pode atualizar orders"
  ON public.orders
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Deletar bloqueado para todos
CREATE POLICY "Ninguém pode deletar orders"
  ON public.orders
  FOR DELETE
  USING (false);


-- ============================================================================
-- 5. TABELA: ADMINS
-- ============================================================================
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor' CHECK (role IN ('editor', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por user_id
CREATE INDEX idx_admins_user_id ON public.admins(user_id);

-- RLS: Admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Apenas service_role pode ler/escrever/editar admins
CREATE POLICY "Apenas service_role acessa admins"
  ON public.admins
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- (Opcional) Admin autenticado pode ver seu próprio registro
CREATE POLICY "Admin vê seu próprio registro"
  ON public.admins
  FOR SELECT
  USING (user_id = auth.uid());


-- ============================================================================
-- 6. FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- 7. DADOS DE TESTE (opcional)
-- ============================================================================
-- INSERT INTO public.products (name, description, price, stock, category, active)
-- VALUES 
--   ('Camiseta Artesanal', 'Camiseta feita à mão com tinta natural', 49.90, 10, 'Roupas', true),
--   ('Pulseira de Macramé', 'Pulseira delicada em tons naturais', 29.90, 20, 'Acessórios', true),
--   ('Vaso de Cerâmica', 'Peça única, 30cm de altura', 89.90, 5, 'Decoração', true);

-- INSERT INTO public.posts (title, slug, content, published)
-- VALUES
--   ('Bem-vindo ao blogFascinatus', 'bem-vindo-blogfascinatus', '# Primeiro Post\n\nEste é nosso primeiro post...', true);
