import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TaskCardSkeleton = () => (
  <Card className="shadow-soft">
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TaskDashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Filters */}
    <div className="flex flex-wrap gap-3">
      <Skeleton className="h-10 w-64 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>

    {/* Task Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
