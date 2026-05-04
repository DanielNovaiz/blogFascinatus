import Link from 'next/link';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/chat', label: 'Chat' },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/negociacoes', label: 'Negociações' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col md:min-h-screen md:flex-row">
        <AdminSidebar />
        <AdminMainContent>{children}</AdminMainContent>
      </div>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside className="w-full border-b border-slate-200 bg-white md:w-64 md:border-b-0 md:border-r">
      <SidebarHeader />
      <SidebarNavigation />
    </aside>
  );
}

function SidebarHeader() {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <h2 className="text-lg font-semibold">Painel Admin</h2>
      <p className="mt-1 text-sm text-slate-500">Admin</p>
    </div>
  );
}

function SidebarNavigation() {
  return (
    <nav className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-2 md:grid-cols-1">
      {ADMIN_NAV_ITEMS.map((item) => (
        <NavigationLink key={item.href} href={item.href} label={item.label} />
      ))}
      <LogoutButton />
    </nav>
  );
}

function NavigationLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {label}
    </Link>
  );
}

function LogoutButton() {
  return (
    <form action="/api/admin/session" method="DELETE">
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-800 text-left"
      >
        Sair
      </button>
    </form>
  );
}

function AdminMainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

function AdminHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold sm:text-lg">Admin Header</h1>
      </div>
    </header>
  );
}
