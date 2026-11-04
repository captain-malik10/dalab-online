import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Truck, Smartphone } from 'lucide-react';

const quickSearches = ['Phones', 'Laptop', 'Skincare', 'Sneakers', 'Kettle'];

function HeroGrid() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : '/shop');
  };

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4189DD] to-[#255FA6] p-6 text-white sm:p-10 lg:col-span-2">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-[#FFB020]/25" />

        <p className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
          Ku soo dhawoow 👋 Welcome to Dalab Online
        </p>
        <h1 className="relative mt-4 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Dalab today, at your door in Mogadishu today.
        </h1>
        <p className="relative mt-4 max-w-xl text-base text-blue-50 sm:text-lg">
          Order from Somalia&apos;s best local stores — delivered to your door, paid with EVC Plus
          or eDahab.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative mt-6 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-lg"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to order? e.g. phone, perfume…"
            className="min-w-0 flex-1 px-4 py-3 text-[#0B1F3A] outline-none"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#FFB020] px-5 font-bold text-[#0B1F3A] hover:bg-amber-400"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        <div className="relative mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-blue-100">Popular:</span>
          {quickSearches.map((term) => (
            <Link
              key={term}
              to={`/shop?q=${encodeURIComponent(term)}`}
              className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25"
            >
              {term}
            </Link>
          ))}
        </div>

        <Link
          to="/shop"
          className="relative mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3 font-bold text-[#255FA6] shadow hover:bg-blue-50"
        >
          Shop now →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Link
          to="/shop?category=Beauty"
          className="relative flex min-h-[180px] overflow-hidden rounded-2xl bg-[#FFF4DD] p-6"
        >
          <div className="relative z-10 max-w-[60%]">
            <p className="text-xs font-bold uppercase tracking-wide text-[#B7791F]">Lido Beauty</p>
            <p className="mt-2 text-xl font-extrabold text-[#0B1F3A]">Eid &amp; wedding glow boxes</p>
            <p className="mt-2 text-sm font-semibold text-[#255FA6]">Shop beauty →</p>
          </div>
          <img
            src="/seed/skincare-set.jpg"
            alt=""
            className="absolute bottom-0 right-0 h-full w-1/2 object-cover"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 35%)' }}
          />
        </Link>

        <div className="flex min-h-[180px] flex-col justify-between rounded-2xl bg-[#0B1F3A] p-6 text-white">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB020] text-[#0B1F3A]">
              <Truck size={20} />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A]">
              <Smartphone size={20} />
            </span>
          </div>
          <div>
            <p className="text-xl font-extrabold">Same-day delivery</p>
            <p className="mt-1 text-sm text-slate-300">
              Order before 2pm in Mogadishu, pay with EVC Plus or eDahab.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroGrid;
