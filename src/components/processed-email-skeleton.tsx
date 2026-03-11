import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProcessedEmailSkeleton() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-28 ml-auto" />
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
