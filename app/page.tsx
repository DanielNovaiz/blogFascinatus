import { FeaturedProducts } from '@/components/public/FeaturedProducts';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-mint-700 uppercase tracking-widest text-sm font-medium mb-4">
            Curadoria Independente
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold text-earth-800 mb-6 leading-tight tracking-tight">
            Beleza que <span className="text-lilac-600">respira</span> arte
          </h1>
          <p className="text-lg text-earth-600 mb-8 leading-relaxed max-w-xl">
            Descubra produtos artesanais únicos, feitos com cuidado e histórias 
            que inspiram uma rotina de beleza mais consciente.
          </p>
          <div className="flex gap-4">
            <Link
              href="/produtos"
              className="inline-flex items-center bg-peach-600 text-white px-8 py-4 rounded-xl hover:bg-peach-700 transition-all duration-300 shadow-lg shadow-peach-200 font-medium"
            >
              Explorar Produtos
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center border-2 border-beige-400 text-earth-700 px-8 py-4 rounded-xl hover:bg-beige-100 transition-all duration-300 font-medium"
            >
              Ler Histórias
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Core Values / Destaques */}
      <section className="py-16 border-t border-beige-200">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-ivory-50 rounded-2xl border border-beige-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-straw-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-straw-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-earth-800 mb-2">Artesanal</h3>
            <p className="text-earth-600 text-sm leading-relaxed">
              Produtos feitos à mão, com ingredientes naturais e processos sustentáveis.
            </p>
          </div>

          <div className="p-6 bg-ivory-50 rounded-2xl border border-beige-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-earth-800 mb-2">Curadoria</h3>
            <p className="text-earth-600 text-sm leading-relaxed">
              Cada produto é selecionado com cuidado, priorizando qualidade e origem.
            </p>
          </div>

          <div className="p-6 bg-ivory-50 rounded-2xl border border-beige-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-peach-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-peach-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-earth-800 mb-2">Conexão</h3>
            <p className="text-earth-600 text-sm leading-relaxed">
              Conheça as histórias por trás de cada criação e seus artesãos.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="bg-gradient-to-r from-straw-50 to-beige-100 rounded-3xl border border-beige-300 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-earth-800 mb-4">
            Fique por dentro das novidades
          </h2>
          <p className="text-earth-600 mb-8 max-w-xl mx-auto">
            Receba dicas, lançamentos e histórias exclusivas sobre beleza consciente direto no seu email.
          </p>
          <div className="flex gap-3 max-w-md mx-auto flex-col sm:flex-row">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-beige-300 bg-white text-earth-800 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-peach-500"
            />
            <button className="px-8 py-3 bg-peach-600 text-white rounded-xl hover:bg-peach-700 transition-colors font-medium whitespace-nowrap">
              Inscrever
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 border-t border-beige-200">
        <div className="text-center mb-12">
          <p className="text-lilac-700 uppercase tracking-widest text-sm font-medium mb-2">Amor de Verdade</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-earth-800">
            O que nossas clientes dizem
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-ivory-50 rounded-2xl border border-beige-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-straw-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-earth-700 mb-6 leading-relaxed">
              "Finalmente encontrei produtos que respeitam minha pele e meus valores. A qualidade é indiscutível e o atendimento me faz voltar sempre."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-peach-300 to-lilac-300" />
              <div>
                <p className="font-semibold text-earth-800 text-sm">Marina S.</p>
                <p className="text-earth-600 text-xs">Cliente desde 2024</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-ivory-50 rounded-2xl border border-beige-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-straw-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-earth-700 mb-6 leading-relaxed">
              "A curadoria é excelente. Cada item conta uma história e isso reflete na qualidade. Minha pele nunca esteve melhor."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-straw-300" />
              <div>
                <p className="font-semibold text-earth-800 text-sm">Julia T.</p>
                <p className="text-earth-600 text-xs">Cliente desde 2025</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-ivory-50 rounded-2xl border border-beige-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-straw-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-earth-700 mb-6 leading-relaxed">
              "Não é só beleza, é um movimento. Gosto de saber quem está por trás de cada produto que uso. Fascinada com tudo isso!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lilac-300 to-peach-300" />
              <div>
                <p className="font-semibold text-earth-800 text-sm">Ana P.</p>
                <p className="text-earth-600 text-xs">Cliente desde 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
