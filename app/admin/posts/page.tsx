'use client';

import { useActionState, useState, useEffect } from 'react';
import { createPost, updatePost, deletePost, uploadPostImage, getPosts } from '@/lib/actions/posts';
import { Post } from '@/types/post';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string>('');
  const [preview, setPreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, formAction, isPending] = useActionState(
    editingId
      ? async (_: any, formData: FormData) => updatePost(editingId, formData)
      : async (_: any, formData: FormData) => createPost(formData),
    { error: null, data: undefined }
  );

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  useEffect(() => {
    if (submitting && !isPending) {
      if (!state.error) {
        setFormOpen(false);
        setCoverImage('');
        setPreview('');
        setEditingId(null);
        getPosts().then(setPosts);
      }

      setSubmitting(false);
    }
  }, [submitting, isPending, state.error]);

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const result = await uploadPostImage(file);

    if (result.error) {
      alert('Erro: ' + result.error);
    } else if (result.url) {
      setCoverImage(result.url);
    }

    setImageLoading(false);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) return;

    await deletePost(id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleSubmit = async (formData: FormData) => {
    if (coverImage) {
      formData.set('cover_image', coverImage);
    }

    setSubmitting(true);
    await formAction(formData);
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setCoverImage(post.cover_image || '');
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setCoverImage('');
            setPreview('');
            setFormOpen(!formOpen);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {formOpen ? 'Cancelar' : 'Novo Post'}
        </button>
      </div>

      {formOpen && (
        <form action={handleSubmit} className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Editar Post' : 'Criar Novo Post'}
            </h2>

            <input
              type="text"
              name="title"
              placeholder="Título"
              required
              defaultValue={editingId ? posts.find((p) => p.id === editingId)?.title : ''}
              onChange={(e) => {
                const titleInput = e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement;
                if (titleInput && !editingId) {
                  titleInput.value = generateSlugFromTitle(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />

            <input
              type="text"
              name="slug"
              placeholder="slug-do-post"
              required
              defaultValue={editingId ? posts.find((p) => p.id === editingId)?.slug : ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />

            <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
            <textarea
              name="content"
              placeholder="# Título\n\nConteúdo em markdown..."
              rows={10}
              required
              defaultValue={editingId ? posts.find((p) => p.id === editingId)?.content : ''}
              onChange={(e) => setPreview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 font-mono text-sm"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageLoading}
                className="px-3 py-2 border border-gray-300 rounded-lg w-full"
              />
              {imageLoading && <p className="text-sm text-gray-500 mt-2">Enviando...</p>}

              {coverImage && (
                <div className="mt-3 relative">
                  <img src={coverImage} alt="preview" className="h-40 w-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" name="published" defaultChecked={false} className="w-4 h-4" />
              <span>Publicado</span>
            </label>

            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 w-full"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Preview</h3>
            <div className="prose prose-sm" id="preview">
              {preview ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: preview
                      .split('\n')
                      .map((line) => {
                        if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
                        if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
                        if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return `<strong>${line.slice(2, -2)}</strong>`;
                        }
                        if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
                        return `<p>${line}</p>`;
                      })
                      .join(''),
                  }}
                />
              ) : (
                <p className="text-gray-400">Preview aparecerá aqui...</p>
              )}
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Slug</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{post.title}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{post.slug}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-3 space-x-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
