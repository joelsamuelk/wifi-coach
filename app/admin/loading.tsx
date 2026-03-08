import { CardSkeleton, PageHeaderSkeleton } from "@/components/wifi/app-primitives";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-4">
        <CardSkeleton className="h-28" />
        <CardSkeleton className="h-28" />
        <CardSkeleton className="h-28" />
        <CardSkeleton className="h-28" />
      </div>
      <CardSkeleton className="h-72" />
      <div className="grid gap-4 xl:grid-cols-2">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>
    </div>
  );
}
