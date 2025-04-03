'use client';

import { ClickEvent } from '@/app/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ClickAnalyticsProps {
  data: ClickEvent[];
  totalPageVisitors: number;
}

export function ClickAnalytics({ data, totalPageVisitors }: ClickAnalyticsProps) {
  // Group clicks by analytics_id and count them
  const analyticsClicks = data.reduce((acc, event) => {
    if (event.analytics_id) {
      acc[event.analytics_id] = (acc[event.analytics_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort by click count
  const analyticsData = Object.entries(analyticsClicks)
    .map(([analyticsId, count]) => ({
      analyticsId,
      count,
      percentage: ((count / totalPageVisitors) * 100).toFixed(2),
    }))
    .sort((a, b) => b.count - a.count);
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Click Analytics</CardTitle>
        <CardDescription>
          Click events grouped by analytics ID with percentage of total visitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Analytics ID</TableHead>
                <TableHead>{'Clicks'}</TableHead>
                <TableHead>{'% of Visitors'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.map(({ analyticsId, count, percentage }) => (
                <TableRow key={analyticsId}>
                  <TableCell>{analyticsId}</TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell>{percentage}%</TableCell>
                </TableRow>
              ))}
              {analyticsData.length === 0 && (
                <TableRow>
                  <TableCell>No click events with analytics IDs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
