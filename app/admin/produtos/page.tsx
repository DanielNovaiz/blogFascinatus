'use client';

import { useActionState, useEffect, useState } from 'react';
import { createProduct, updateProduct, deleteProduct, uploadProductImage, getProducts } from '@/lib/actions/products';
import { Product } from '@/types/product';

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, formAction, isPending] = useActionState(
    editingId
      ? async (_: any, formData: FormData) => updateProduct(editingId, formData)
      : async (_: any, formData: FormData) => createProduct(formData),
    { error: null, data: undefined }
  );

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (submitting && !isPending) {
      if (!state.error) {
        setFormOpen(false);
        setImages([]);
        setEditingId(null);
        getProducts().then(setProducts);
      }

      setSubmitting(false);
    }
  }, [submitting, isPending, state]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const result = await uploadProductImage(file);

    if (result.error) {
      alert('Erro: ' + result.error);
    } else if (result.url) {
      setImages([...images, result.url]);
    }

    setImageLoading(false);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;

    await deleteProduct(id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set('images', JSON.stringify(images));
    setSubmitting(true);
    await formAction(formData);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setImages(product.images || []);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-earth-800">Produtos</h1>
          <p className="text-earth-600 mt-2">Gerenciar catálogo de produtos</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setImages([]);
            setFormOpen(!formOpen);
          }}
          className="bg-peach-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-peach-700 transition-all"
        >
          {formOpen ? 'Cancelar' : '+ Novo Produto'}
        </button>
      </div>

      {formOpen && (
        <form action={handleSubmit} className="bg-ivory-50 border border-beige-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-earth-800 mb-4">
            {editingId ? 'Editar Produto' : 'Criar Novo Produto'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Nome"
              required
              className="px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500"
            />
            <input
              type="number"
              name="price"
              placeholder="Preço"
              step="0.01"
              required
              className="px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              required
              className="px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500"
            />
            <input
              type="text"
              name="category"
              placeholder="Categoria"
              required
              className="px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500"
            />
          </div>

          <textarea
            name="description"
            placeholder="Descrição"
            rows={3}
            className="w-full px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 focus:outline-none focus:border-peach-500 mb-4"
          />

          <div className="mb-4">
            <label className="flex items-center gap-2 text-earth-700">
              <input type="checkbox" name="active" defaultChecked className="w-4 h-4 accent-peach-600" />
              <span>Ativo</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-earth-700">Imagens</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageLoading}
              className="px-4 py-3 border border-beige-300 rounded-xl bg-white text-earth-900 w-full"
            />
            {imageLoading && <p className="text-sm text-earth-600 mt-2">Enviando...</p>}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="preview" className="h-20 w-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-peach-600 text-white rounded-full w-6 h-6"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {state?.error && (
            <div className="bg-peach-50 border border-peach-200 text-peach-700 px-4 py-3 rounded-xl mb-4">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-forest-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-forest-700 disabled:bg-beige-400 transition-all"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <div className="bg-ivory-50 border border-beige-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-earth-900 text-ivory-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Preço</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Categoria</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-beige-200 hover:bg-beige-100 transition-colors">
                <td className="px-6 py-4 text-earth-800">{product.name}</td>
                <td className="px-6 py-4 text-peach-600 font-semibold">R$ {product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-earth-600">{product.stock}</td>
                <td className="px-6 py-4 text-earth-600">{product.category}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.active ? 'bg-mint-100 text-mint-700' : 'bg-beige-200 text-earth-600'
                    }`}
                  >
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-earth-700 hover:text-peach-600 text-sm font-medium transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-earth-700 hover:text-peach-600 text-sm font-medium transition-colors"
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
