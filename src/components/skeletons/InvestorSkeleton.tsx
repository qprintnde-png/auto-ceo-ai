import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const InvestorCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

const CompanySelectorSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-32" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </CardContent>
  </Card>
);

export const InvestorPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    {/* Header */}
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    </div>

    {/* Company Selector */}
    <CompanySelectorSkeleton />

    {/* Match Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Skeleton className="h-10 w-36 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>

    {/* Investor Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <InvestorCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
