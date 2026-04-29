export default function ProductSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Imagem skeleton */}
      <div className="w-full h-48 bg-gray-200 animate-pulse" />

      {/* Info skeleton */}
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-1/2" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}
