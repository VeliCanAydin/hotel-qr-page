import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Resim Alanı Fallback */}
      <div className="relative w-full h-[200px]">
        <Skeleton className="w-full h-full rounded-3xl" />
      </div>

      {/* Başlık Fallback */}
      <Skeleton className="h-7 w-3/4" />

      {/* Açıklama Metni Fallback (2 satır simülasyonu) */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Butonlar Fallback */}
      <div className="flex flex-row gap-3 mt-2">
        {/* View Menu Butonu */}
        <Skeleton className="h-10 w-32 rounded-3xl" />
        
        {/* Reservation Butonu (Opsiyonel olduğu için buraya da koyuyoruz ki yer kaplasın) */}
        <Skeleton className="h-10 w-40 rounded-3xl" />
      </div>
    </div>
  );
}