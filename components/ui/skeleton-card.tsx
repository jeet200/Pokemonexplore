import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="pt-6 px-6 flex justify-center">
        <Skeleton className="h-[120px] w-[120px] rounded-full" />
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardFooter>
    </Card>
  )
}
