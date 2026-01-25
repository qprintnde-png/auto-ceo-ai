import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BusinessPlanCardSkeleton = () => (
  <Card className="shadow-soft border">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </CardContent>
  </Card>
);

export const BusinessPlanListSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-end">
      <Skeleton className="h-11 w-44 rounded-md" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <BusinessPlanCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
