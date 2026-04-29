import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
import { CartDrawer } from '@/components/CartDrawer';
import { SearchBar } from '@/components/SearchBar';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'blogFascinatus',
    template: '%s | blogFascinatus',
  },
  description: 'Blog + Loja de produtos artesanais com curadoria independente.',
  openGraph: {
    title: 'blogFascinatus',
    description: 'Loja e blog de produtos artesanais.',
    url: appUrl,
    siteName: 'blogFascinatus',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.className} bg-ivory-100 text-earth-900 antialiased`}>
        <CartProvider>
          {/* Header com branco gelo */}
          <nav className="bg-ivory-50/90 backdrop-blur-sm border-b border-beige-200 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
              <a
                href="/"
                className="text-2xl font-semibold tracking-tight text-earth-800 hover:text-peach-600 transition-colors"
              >
                blogFascinatus
              </a>
              <div className="order-3 w-full md:order-2 md:flex-1 md:max-w-md">
                <SearchBar />
              </div>
              <ul className="flex gap-6 items-center">
                <li>
                  <a
                    href="/produtos"
                    className="text-earth-700 hover:text-peach-600 font-medium transition-colors relative group"
                  >
                    Produtos
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lilac-400 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-earth-700 hover:text-peach-600 font-medium transition-colors relative group"
                  >
                    Blog
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lilac-400 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
                <li>
                  <CartDrawer />
                </li>
              </ul>
            </div>
          </nav>

          <main className="max-w-6xl mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
            {children}
          </main>

          <footer className="bg-beige-100 border-t border-beige-200 mt-16">
            <div className="max-w-6xl mx-auto px-4 py-12">
              {/* Footer Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-beige-300">
                {/* Brand */}
                <div className="md:col-span-1">
                  <h3 className="text-lg font-semibold text-earth-800 mb-4">blogFascinatus</h3>
                  <p className="text-sm text-earth-600 mb-4">
                    Curadoria independente de produtos de beleza artesanais premium.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="text-earth-600 hover:text-peach-600 transition-colors">
                      <span className="sr-only">Instagram</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.251-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                        <circle cx="12" cy="12" r="3.6" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Navegação */}
                <div>
                  <h4 className="text-sm font-semibold text-earth-800 mb-4 uppercase tracking-wider">Loja</h4>
                  <ul className="space-y-2">
                    <li><a href="/produtos" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">Todos os Produtos</a></li>
                    <li><a href="/blog" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">Blog</a></li>
                    <li><a href="/produtos?cat=skincare" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">Skincare</a></li>
                  </ul>
                </div>

                {/* Sobre */}
                <div>
                  <h4 className="text-sm font-semibold text-earth-800 mb-4 uppercase tracking-wider">Sobre</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">Nossa História</a></li>
                    <li><a href="#" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">Sustentabilidade</a></li>
                    <li><a href="/admin/login" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">Painel Admin</a></li>
                  </ul>
                </div>

                {/* Contato */}
                <div>
                  <h4 className="text-sm font-semibold text-earth-800 mb-4 uppercase tracking-wider">Contato</h4>
                  <ul className="space-y-2">
                    <li><a href="mailto:contato@blogfascinatus.com" className="text-sm text-earth-600 hover:text-peach-600 transition-colors">contato@blogfascinatus.com</a></li>
                    <li><p className="text-sm text-earth-600">Segunda a Sexta<br/>9h às 18h</p></li>
                  </ul>
                </div>
              </div>

              {/* Footer Bottom */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-earth-600">
                <p>&copy; 2026 blogFascinatus. Todos os direitos reservados.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-peach-600 transition-colors">Política de Privacidade</a>
                  <a href="#" className="hover:text-peach-600 transition-colors">Termos de Serviço</a>
                </div>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
