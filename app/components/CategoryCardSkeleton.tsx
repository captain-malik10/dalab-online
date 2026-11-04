export default function CategoryCardSkeleton() {
  return (
    <div className="relative flex h-[200px] w-[160px] shrink-0 animate-pulse overflow-hidden rounded bg-gray-300 shadow-lg">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-400 to-transparent p-4">
        <div className="h-6 w-3/4 rounded bg-gray-500"></div>
      </div>
    </div>
  );
}
