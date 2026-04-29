'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProducts,
} from '@/lib/actions/products';
import { Product } from '@/types/product';

export default function AdminObjetosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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
  }, [submitting, isPending, state.error]);

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
    if (!window.confirm('Tem certeza que deseja deletar este objeto?')) return;

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

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [product.name, product.category, product.description || '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.active) ||
        (statusFilter === 'inactive' && !product.active);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const activeCount = products.filter((product) => product.active).length;
  const inactiveCount = products.length - activeCount;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Objetos</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setImages([]);
            setFormOpen(!formOpen);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {formOpen ? 'Cancelar' : 'Novo Objeto'}
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Cadastre e gerencie os objetos vendidos na loja.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs uppercase text-gray-500">Total</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs uppercase text-gray-500">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs uppercase text-gray-500">Inativos</p>
          <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <label className="block text-xs uppercase text-gray-500 mb-1">Buscar</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nome, categoria ou descrição"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              statusFilter === 'inactive'
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Inativos
          </button>
        </div>
      </div>

      {formOpen && (
        <form action={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Editar Objeto' : 'Criar Novo Objeto'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Nome"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="price"
              placeholder="Preço"
              step="0.01"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="stock"
              placeholder="Estoque"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="category"
              placeholder="Categoria"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <textarea
            name="description"
            placeholder="Descrição"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
          />

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked className="w-4 h-4" />
              <span>Ativo</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Imagens</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg w-full"
            />
            {imageLoading && <p className="text-sm text-gray-500 mt-2">Enviando...</p>}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="preview" className="h-20 w-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Preço</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Estoque</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Categoria</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3">{product.name}</td>
                <td className="px-6 py-3">R$ {product.price.toFixed(2)}</td>
                <td className="px-6 py-3">{product.stock}</td>
                <td className="px-6 py-3">{product.category}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-3 space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            Nenhum objeto encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}