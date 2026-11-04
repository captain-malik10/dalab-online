import type { Route } from './+types/home';
import CategoryCard from '~/components/CategoryCard';
import ProductCard from '~/components/ProductCard';
import { HorizontalCard } from '~/components/HorizontalCard';
import HeroGrid from '~/components/HeroGrid';
import React, { useRef, useState, type MouseEvent } from 'react';
import Footer from '~/components/Footer';
import Header from '~/components/Header';
import CategorySeparator from '~/components/CategorySeparator';
import { useHome } from '~/hooks/useHome';
import ProductCardSkeleton from '~/components/ProductCardSkeleton';
import CategoryCardSkeleton from '~/components/CategoryCardSkeleton';
import AuthMessage from '~/components/AuthMessage';

import electronic from '~/assets/images/bg-removed/electronic.png';
import fashion from '~/assets/images/bg-removed/fashion.png';
import home from '~/assets/images/bg-removed/home.png';
import sports from '~/assets/images/bg-removed/sports.png';
import travel from '~/assets/images/bg-removed/travel.png';

const categoriesSeparators = [
  {
    categoryName: 'Electronics',
    description:
      'Discover the latest in tech and gadgets. From smartphones to smart home devices, we have everything you need to stay connected.',
    imageSrc: electronic,
    shopLink: '/shop?category=electronics',
    bgColor: '#4CAF50',
  },
  {
    categoryName: 'Fashion',
    description:
      'Elevate your wardrobe with timeless silhouettes and bold details—curated pieces that blend effortless comfort with modern edge. Discover seasonal must-haves, sustainable staples, and statement accessories to define your signature look.',
    imageSrc: fashion,
    shopLink: '/shop?category=fashion',
    bgColor: '#2196F3',
  },
  {
    categoryName: 'Home',
    description:
      'Create a space you love with our collection of home goods. Find furniture, decor, and more to make your house a home.',
    imageSrc: home,
    shopLink: '/shop?category=home',
    bgColor: '#FFC107',
  },
  {
    categoryName: 'Sports',
    description:
      "Get in the game with our selection of sports equipment and apparel. Whether you're a pro or just starting out, we have what you need to perform your best.",
    imageSrc: sports,
    shopLink: '/shop?category=sports',
    bgColor: '#F44336',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Ashal - Your Marketplace' },
    { name: 'description', content: 'Welcome to Ashal!' },
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
        <div className="my-4 mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <HorizontalCard
            title="Discount coupons"
            description="Take advantage of our Exclusive Sales for Smart and Economical Shopping."
            linkText="Discover coupons"
            linkHref="#"
            imageUrl="https://i.pinimg.com/736x/ef/eb/73/efeb7363561cbf596a0684e25f5fa175.jpg"
          />
          <HorizontalCard
            title="Delivery Everywhere"
            description="Our Reliable Delivery Service to Ensure Your Purchases Arrive Quickly and Safely."
            linkText="delivery conditions"
            linkHref="#"
            imageUrl="https://i.pinimg.com/736x/c3/30/fb/c330fb0a1e0fd825dbf7cb809a49febe.jpg"
          />
          <HorizontalCard
            title="Secure Payment"
            description="Discover our Payment Methods for a Worry-Free Shopping Experience."
            linkText="Discover"
            linkHref="#"
            imageUrl="https://i.pinimg.com/736x/8b/61/6d/8b616dd1c4fd5db723133800f1b10bef.jpg"
          />
          <HorizontalCard
            title="24/7 Customer Service"
            description="Your Satisfaction is our Commitment, Enjoy Personalized Assistance at Every Step."
            linkText="Get Help"
            linkHref="#"
            imageUrl="https://i.pinimg.com/736x/81/d1/d4/81d1d446cf0d896c9eeb7bab7b0711ce.jpg"
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Products by category</h1>
            <a
              href="#"
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
            >
              See all categories
            </a>
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
            <h1 className="text-xl font-bold">Popular products</h1>
            <a
              href="#"
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
            >
              See all products
            </a>
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
