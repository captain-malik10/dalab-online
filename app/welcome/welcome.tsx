import CategoryCard from '~/components/CategoryCard';
import logo from '../assets/images/logo.png';
import { HorizontalCard } from '../components/HorizontalCard';

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col px-4 gap-16 min-h-0">
        <HorizontalCard
          title="Discount coupons"
          description="Enjoy our Exclusive Sales for Smartly Economical Shopping."
          linkText="Discover coupons"
          linkHref="#"
          imageUrl="https://i.pinimg.com/736x/ef/eb/73/efeb7363561cbf596a0684e25f5fa175.jpg"
        />
        <HorizontalCard
          title="Service "
          description="We work 24/7 to provide you with the best service."
          linkText="Explore services"
          linkHref="#"
          imageUrl="https://i.pinimg.com/736x/3d/e5/d8/3de5d8f958c39153525bfeb99dbe669f.jpg"
        />
        <div className="flex gap-4">
          <CategoryCard
            image_link="https://i.pinimg.com/736x/43/15/ae/4315ae69df9daa2550203db798b0d77f.jpg"
            title="Electronics"
          />
          <CategoryCard
            image_link="https://i.pinimg.com/736x/d9/5c/d0/d95cd04d85043401df2b957eeba934cd.jpg"
            title="Cars"
          />
        </div>
      </div>
    </main>
  );
}
