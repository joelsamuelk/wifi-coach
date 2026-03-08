import { CardSkeleton, PageHeaderSkeleton } from "@/components/wifi/app-primitives";

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton />
      <CardSkeleton className="h-44" />
      <CardSkeleton className="h-52" />
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton className="h-32" />
        <CardSkeleton className="h-32" />
      </div>
      <CardSkeleton className="h-24" />
    </div>
  );
}
