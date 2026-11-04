import { Link } from 'react-router';
import { Clock, MapPin, ShieldCheck, Truck } from 'lucide-react';
import Logo from './Logo';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/shop' },
      { label: 'Electronics', to: '/shop?category=Electronics' },
      { label: 'Phones & Accessories', to: '/shop?category=Phones %26 Accessories' },
      { label: 'Fashion', to: '/shop?category=Fashion' },
      { label: 'Home & Kitchen', to: '/shop?category=Home %26 Kitchen' },
      { label: 'Beauty', to: '/shop?category=Beauty' },
    ],
  },
  {
    title: 'My account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'My orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Sell & support',
    links: [
      { label: 'Open your store', to: '/store' },
      { label: 'Seller login', to: '/store' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
];

const promises = [
  { icon: Truck, text: 'Same-day delivery in Mogadishu' },
  { icon: ShieldCheck, text: 'Trusted, verified local stores' },
  { icon: Clock, text: 'Support Sat–Thu, 8am–10pm' },
];

function Footer() {
  return (
    <footer className="mt-12 bg-[#0B1F3A] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Ku soo dhawoow Dalab Online! Order from Somalia&apos;s best local stores — delivered to
              your door, paid with EVC Plus or eDahab.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {promises.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon size={18} className="text-[#FFB020]" />
                  {text}
                </li>
              ))}
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-[#FFB020]" />
                Maka Al-Mukarama Road, Mogadishu, Somalia
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
                {column.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-[#FFB020]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Dalab Online · Mahadsanid for shopping local.</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">We accept</span>
            <span className="rounded bg-[#16A34A] px-2 py-1 font-bold text-white">EVC Plus</span>
            <span className="rounded bg-[#FFB020] px-2 py-1 font-bold text-[#0B1F3A]">eDahab</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
