import Link from 'next/link';
import { Post } from '@/types/post';
import { getExcerpt } from '@/lib/markdown';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const excerpt = getExcerpt(post.content, 160);
  const date = new Date(post.created_at).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-ivory-50 border border-beige-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-beige-200/50 hover:border-lilac-200 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {post.cover_image && (
          <div className="w-full h-52 bg-beige-100 overflow-hidden relative">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-900/10 to-transparent" />
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-3 line-clamp-2 text-earth-800 group-hover:text-peach-600 transition-colors">
            {post.title}
          </h2>
          <time className="text-sm text-mint-700 block mb-3 uppercase tracking-wide text-xs font-medium">
            {date}
          </time>
          <p className="text-earth-600 line-clamp-3 leading-relaxed">{excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
