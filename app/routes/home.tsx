import type { Route } from './+types/home';
import CategoryCard from '~/components/CategoryCard';
import ProductCard from '~/components/ProductCard';
import HeroGrid from '~/components/HeroGrid';
import React, { useRef, useState, type MouseEvent } from 'react';
import Footer from '~/components/Footer';
import Header from '~/components/Header';
import CategorySeparator from '~/components/CategorySeparator';
import { useHome } from '~/hooks/useHome';
import ProductCardSkeleton from '~/components/ProductCardSkeleton';
import CategoryCardSkeleton from '~/components/CategoryCardSkeleton';
import AuthMessage from '~/components/AuthMessage';
import { Headphones, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import { Link } from 'react-router';

import electronic from '~/assets/images/bg-removed/electronic.png';
import fashion from '~/assets/images/bg-removed/fashion.png';
import home from '~/assets/images/bg-removed/home.png';
import sports from '~/assets/images/bg-removed/sports.png';

const categoriesSeparators = [
  {
    categoryName: 'Electronics',
    description:
      'Laptops, headphones and smart gadgets from trusted Hodan Electronics — with shop warranty and delivery across Mogadishu.',
    imageSrc: electronic,
    shopLink: '/shop?category=Electronics',
    bgColor: '#4189DD',
  },
  {
    categoryName: 'Fashion',
    description:
      'From wedding suits to everyday blazers and family outfits — fresh styles from Xamar Fashion House, ready for Eid.',
    imageSrc: fashion,
    shopLink: '/shop?category=Fashion',
    bgColor: '#0B1F3A',
  },
  {
    categoryName: 'Home & Kitchen',
    description:
      'Fridges that stay cool through power cuts, washing machines, kettles and cookware from Bakaaro Home & Kitchen.',
    imageSrc: home,
    shopLink: '/shop?category=Home%20%26%20Kitchen',
    bgColor: '#255FA6',
  },
  {
    categoryName: 'Sports',
    description:
      'Sneakers, footballs and gear for the beach at Lido or the pitch after school. Kaalay ciyaar!',
    imageSrc: sports,
    shopLink: '/shop?category=Sports',
    bgColor: '#16A34A',
  },
];

const whyDalab = [
  { icon: Truck, title: 'Same-day delivery', text: 'Across Mogadishu when you order before 2pm.' },
  { icon: Smartphone, title: 'EVC Plus & eDahab', text: 'Pay from your phone — no card needed.' },
  { icon: ShieldCheck, title: 'Trusted local stores', text: 'Every seller is verified by our team.' },
  { icon: Headphones, title: 'Real people, real help', text: 'Call or message us, Somali or English.' },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dalab Online — Ku soo dhawoow!' },
    {
      name: 'description',
      content:
        "Order from Somalia's best local stores — delivered to your door, paid with EVC Plus or eDahab.",
    },
  ];
}

export default function Home() {
  const { featuredProducts, categories, productsByCategory, loading, error } = useHome();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const productScrollRef = useRef<HTMLDivElement | null>(null);
  const [pIsDragging, setPIsDragging] = useState(false);
  const [pStartX, setPStartX] = useState(0);
  const [pScrollLeft, setPScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleProductMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!productScrollRef.current) return;
    setPIsDragging(true);
    setPStartX(e.pageX - productScrollRef.current.offsetLeft);
    setPScrollLeft(productScrollRef.current.scrollLeft);
  };

  const handleProductMouseLeave = () => setPIsDragging(false);
  const handleProductMouseUp = () => setPIsDragging(false);

  const handleProductMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!pIsDragging || !productScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - productScrollRef.current.offsetLeft;
    const walk = (x - pStartX) * 1;
    productScrollRef.current.scrollLeft = pScrollLeft - walk;
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };



  return (
    <div className="min-h-screen">
      <Header />
      <div className="p-4">
        <HeroGrid />
        <section className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {whyDalab.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4189DD]">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-[var(--color-muted)]">{text}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Shop by category</h2>
            <Link
              to="/shop"
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
            >
              See all
            </Link>
          </div>
          <div
            ref={scrollRef}
            className="flex w-full gap-4 overflow-x-auto hide-scrollbar py-4 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {error ? (
              <AuthMessage message={error} type="error" />
            ) : loading ? (
              Array.from({ length: 5 }).map((_, index) => <CategoryCardSkeleton key={index} />)
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.name}
                  image_link={category.image_url}
                />
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Popular now in Mogadishu</h2>
            <Link
              to="/shop"
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
            >
              See all products
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {error ? (
              <AuthMessage message={error} type="error" />
            ) : loading ? (
              Array.from({ length: 10 }).map((_, index) => <ProductCardSkeleton key={index} />)
            ) : (
              featuredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 my-4">
          {categoriesSeparators.map((category) => (
            <React.Fragment key={category.categoryName}>
              <CategorySeparator
                categoryName={category.categoryName}
                description={category.description}
                imageSrc={category.imageSrc}
                shopLink={category.shopLink}
                bgColor={category.bgColor} // Pass the new bgColor prop
              />
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {error ? (
                  <AuthMessage message={error} type="error" />
                ) : loading ? (
                  Array.from({ length: 5 }).map((_, index) => <ProductCardSkeleton key={index} />)
                ) : (
                  (productsByCategory[category.categoryName] || []).map((product) => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
