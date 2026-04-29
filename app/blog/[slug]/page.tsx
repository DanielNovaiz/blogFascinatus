import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/post';
import { markdownToHtml } from '@/lib/markdown';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !post) return null;
  return post;
}

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('published', true);

  return (posts || []).map((post) => ({
    slug: post.slug,
  }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await params.then(p => p.slug);
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post não encontrado',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.created_at,
      ...(post.cover_image && {
        images: [post.cover_image],
      }),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const slug = await params.then(p => p.slug);
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
        <a href="/blog" className="text-blue-600 hover:underline">
          Voltar para blog
        </a>
      </div>
    );
  }

  const htmlContent = await markdownToHtml(post.content);
  const date = new Date(post.created_at).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto">
      <a href="/blog" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Voltar para blog
      </a>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <time className="text-gray-600">{date}</time>
      </header>

      {post.cover_image && (
        <div className="mb-8 rounded-lg overflow-hidden bg-gray-100 h-96">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
