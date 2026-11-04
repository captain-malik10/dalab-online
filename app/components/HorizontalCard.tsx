interface HorizontalCardProps {
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  imageUrl: string;
}

export function HorizontalCard({
  title,
  description,
  linkText,
  linkHref,
  imageUrl,
}: HorizontalCardProps) {
  return (
    <div className="flex h-28 w-full overflow-hidden rounded bg-[var(--color-surface)] shadow-sm">
      <img src={imageUrl} alt={title} className="w-24 h-auto object-cover" />
      <div className="flex flex-col justify-center overflow-hidden border-l border-gray-500 p-3">
        <h2 className="truncate text-lg font-semibold text-[var(--color-dark)]">{title}</h2>
        <p className="truncate text-sm text-[var(--color-muted)]">{description}</p>
      </div>
    </div>
  );
}
