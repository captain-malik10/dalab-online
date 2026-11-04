import React from 'react';
import { Link } from 'react-router';
import { MoveRight } from 'lucide-react';

interface CategorySeparatorProps {
  categoryName: string;
  description: string;
  imageSrc: string;
  shopLink: string;
  bgColor: string;
}

function CategorySeparator({
  categoryName,
  description,
  imageSrc,
  shopLink,
  bgColor,
}: CategorySeparatorProps) {
  return (
    <div
      className="relative w-full items-center overflow-hidden rounded-2xl px-6 sm:px-10 flex min-h-[140px]"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 50%, rgba(255,255,255,0.18) 0, transparent 45%), radial-gradient(circle at 10% 120%, rgba(255,176,32,0.35) 0, transparent 40%)',
        }}
      ></div>

      <div className="relative z-10 flex w-2/3 flex-col text-white items-start gap-2 py-6">
        <h1 className="text-xl font-bold capitalize">{categoryName}</h1>
        <p className="text-sm sm:text-base text-white/90">{description}</p>
        <Link
          to={shopLink}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#FFB020] px-4 py-2 text-sm font-bold text-[#0B1F3A] hover:bg-amber-400"
        >
          Shop {categoryName} <MoveRight size={16} />
        </Link>
      </div>
      <img src={imageSrc} alt={categoryName} className="absolute right-2 bottom-0 h-[120%] max-h-[220px] z-10 hidden sm:block" />
    </div>
  );
}

export default CategorySeparator;
