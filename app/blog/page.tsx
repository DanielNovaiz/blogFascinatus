import { supabase } from '@/lib/supabase';
import PostCard from '@/components/PostCard';

const POSTS_PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

async function getPosts(page: number) {
  const offset = (page - 1) * POSTS_PER_PAGE;

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1);

  if (error) {
    console.error('Erro ao buscar posts:', error);
    return { posts: null, error };
  }

  return { posts, error: null };
}

async function getTotalPosts() {
  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('published', true);

  return count || 0;
}

export const revalidate = 60;

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1'));

  const { posts, error } = await getPosts(currentPage);
  const totalPosts = await getTotalPosts();
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (error) {
    return (
      <div className="text-center text-peach-700 bg-peach-50 rounded-xl p-8">
        Erro ao carregar posts. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <p className="text-mint-700 uppercase tracking-widest text-sm font-medium mb-2">
          Histórias
        </p>
        <h1 className="text-4xl font-semibold text-earth-800 mb-4">Blog</h1>
        <p className="text-earth-600 max-w-2xl">
          Explorando o universo da beleza artesanal, sustentabilidade e as histórias 
          por trás de cada criação.
        </p>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center text-earth-600 bg-beige-100/50 rounded-xl p-12">
          Nenhum post publicado ainda.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {currentPage > 1 && (
                <a
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-4 py-2 border border-beige-300 rounded-xl hover:bg-beige-100 text-earth-700 transition-colors"
                >
                  ← Anterior
                </a>
              )}

              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  return (
                    <a
                      key={page}
                      href={`/blog?page=${page}`}
                      className={`px-3 py-2 rounded-xl border font-medium transition-colors ${
                        isActive
                          ? 'bg-peach-600 text-white border-peach-600'
                          : 'border-beige-300 hover:bg-beige-100 text-earth-700'
                      }`}
                    >
                      {page}
                    </a>
                  );
                })}
              </div>

              {currentPage < totalPages && (
                <a
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-4 py-2 border border-beige-300 rounded-xl hover:bg-beige-100 text-earth-700 transition-colors"
                >
                  Próxima →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
