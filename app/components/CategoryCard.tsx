import { Link } from 'react-router';

export default function CategoryCard({
  title,
  image_link,
}: {
  title?: string;
  image_link?: string;
}) {
  return (
    <Link to={`/shop?category=${title}`}>
      <div className="relative flex h-[200px] w-[160px] shrink-0 overflow-hidden rounded bg-[var(--color-surface)] shadow-lg select-none cursor-pointer">
        <img
          src={image_link}
          alt={title}
          className="h-full w-full object-cover pointer-events-none"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-black/0 bg-opacity-50 p-4 text-white">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
      </div>
    </Link>
  );
}
