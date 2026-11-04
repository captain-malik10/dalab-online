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
  const textureUrl = 'https://i.pinimg.com/736x/3e/2e/bf/3e2ebfbbbb5e2e57dc14089ddc840181.jpg';

  return (
    <div
      className="relative w-full items-center px-10 flex min-h-[120px]"
      style={{ backgroundColor: bgColor }} // Base color
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${textureUrl})`,
          backgroundRepeat: 'repeat',
          opacity: 0.2,
        }}
      ></div>

      <div className="relative z-10 flex w-5/6 flex-col text-white items-start gap-2">
        <h1 className="text-xl font-bold capitalize">{categoryName}</h1>
        <p className="">{description}</p>
      </div>
      <img src={imageSrc} alt={categoryName} className="absolute right-0 bottom-0 h-[150%] z-10" />
    </div>
  );
}

export default CategorySeparator;
