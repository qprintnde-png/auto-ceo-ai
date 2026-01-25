import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FinancialCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
    </CardContent>
  </Card>
);

const MetricCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full rounded-md" />
    </CardContent>
  </Card>
);

export const FinancialDashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 border-b pb-2">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>

    {/* Data Table */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
