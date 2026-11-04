export default function ProductCardSkeleton() {
  return (
    <div className="relative flex h-[350px] w-full flex-col overflow-hidden rounded bg-white shadow-sm animate-pulse">
      <div className="h-[180px] w-full bg-gray-300"></div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
          <div className="mb-4 h-3 w-1/2 rounded bg-gray-300"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 w-1/3 rounded bg-gray-300"></div>
          <div className="h-8 w-1/3 rounded bg-gray-300"></div>
        </div>
        <div className="mt-4 h-10 w-full rounded bg-gray-400"></div>
      </div>
    </div>
  );
}
