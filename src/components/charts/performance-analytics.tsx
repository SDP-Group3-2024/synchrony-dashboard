import { PerformanceEventData } from '@/app/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils';

interface PerformanceAnalyticsProps {
  data: PerformanceEventData[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export function PerformanceAnalytics({ data, dateRange }: PerformanceAnalyticsProps) {
  // Calculate average metrics
  const metrics = {
    loadTime: data.reduce((acc, curr) => acc + curr.load_time, 0) / data.length,
    domInteractive:
      data.reduce((acc, curr) => acc + curr.dom_interactive_time, 0) / data.length,
    domComplete: data.reduce((acc, curr) => acc + curr.dom_complete_time, 0) / data.length,
    firstContentfulPaint:
      data.reduce((acc, curr) => acc + (curr.first_contentful_paint || 0), 0) / data.length,
    largestContentfulPaint:
      data.reduce((acc, curr) => acc + (curr.largest_contentful_paint || 0), 0) /
      data.length,
    firstInputDelay:
      data.reduce((acc, curr) => acc + (curr.first_input_delay || 0), 0) / data.length,
    cumulativeLayoutShift:
      data.reduce((acc, curr) => acc + (curr.cumulative_layout_shift || 0), 0) /
      data.length,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Performance Metrics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Page Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuration(metrics.loadTime)}</p>
            <p className="text-sm text-muted-foreground">Average time to load the page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DOM Interactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuration(metrics.domInteractive)}</p>
            <p className="text-sm text-muted-foreground">Time until DOM is interactive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DOM Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuration(metrics.domComplete)}</p>
            <p className="text-sm text-muted-foreground">Time until DOM is complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>First Contentful Paint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDuration(metrics.firstContentfulPaint)}
            </p>
            <p className="text-sm text-muted-foreground">
              Time until first content is painted
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
