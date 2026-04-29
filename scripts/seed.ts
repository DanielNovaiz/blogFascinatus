import { createClient } from '@supabase/supabase-js';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function runSeed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Seed admin user
  const adminEmail = 'admin@blogfascinatus.com';
  const adminPassword = 'admin123';
  const passwordHash = await hashPassword(adminPassword);

  const { data: existingAdmin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', adminEmail)
    .maybeSingle();

  if (!existingAdmin) {
    const { error: adminError } = await supabase.from('admin_users').insert([{
      email: adminEmail,
      password_hash: passwordHash,
      role: 'super_admin',
      full_name: 'Administrador',
      is_active: true,
    }]);
    if (adminError) {
      throw new Error(`Erro ao inserir admin: ${adminError.message}`);
    }
    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  const products = [
    {
      name: 'Camiseta Artesanal Terra',
      description: 'Camiseta de algodão com tingimento natural em lote pequeno.',
      price: 79.9,
      stock: 20,
      category: 'Roupas',
      active: true,
      images: [],
    },
    {
      name: 'Caneca Cerâmica Ateliê',
      description: 'Caneca de cerâmica artesanal com acabamento fosco.',
      price: 59.9,
      stock: 15,
      category: 'Casa',
      active: true,
      images: [],
    },
    {
      name: 'Vela Botânica Calmaria',
      description: 'Vela vegetal com blend botânico e aroma suave.',
      price: 42.5,
      stock: 30,
      category: 'Bem-estar',
      active: true,
      images: [],
    },
  ];

  for (const product of products) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', product.name)
      .maybeSingle();

    if (existing) {
      continue;
    }

    const { error } = await supabase.from('products').insert([product]);
    if (error) {
      throw new Error(`Erro ao inserir produto ${product.name}: ${error.message}`);
    }
  }

  const post = {
    title: 'Bem-vindo ao blogFascinatus',
    slug: 'bem-vindo-ao-blogfascinatus',
    content:
      '# Primeiros passos\n\nEste é um post de exemplo para ambiente de desenvolvimento.',
    cover_image: null,
    published: true,
  };

  const { data: existingPost } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', post.slug)
    .maybeSingle();

  if (!existingPost) {
    const { error } = await supabase.from('posts').insert([post]);
    if (error) {
      throw new Error(`Erro ao inserir post de exemplo: ${error.message}`);
    }
  }

  console.log('Seed concluído com sucesso.');
}

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});