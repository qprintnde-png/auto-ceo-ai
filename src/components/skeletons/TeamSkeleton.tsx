import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TeamMemberCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex flex-wrap gap-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
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
    <CardContent>
      <Skeleton className="h-10 w-full rounded-md" />
    </CardContent>
  </Card>
);

export const TeamPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    {/* Header */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Company Selector */}
      <CompanySelectorSkeleton />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>

    {/* Team Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>

    {/* Team Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <TeamMemberCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
