import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ScrollEvent } from '@/app/lib/types';

interface ScrollAnalyticsProps {
  data: ScrollEvent[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Helper function to calculate metrics
function calculateMetrics(data: ScrollEvent[]) {
  const averageScrollDepth =
    data.length > 0
      ? data.reduce((acc, curr) => acc + curr.scroll_depth, 0) / data.length
      : 0;
  const maxScrollDepth =
    data.length > 0 ? Math.max(...data.map((item) => item.scroll_depth)) : 0;
  const downScrolls = data.filter((item) => item.scroll_direction === 'down').length;
  const upScrolls = data.filter((item) => item.scroll_direction === 'up').length;
  const scrollRatio =
    downScrolls + upScrolls > 0 ? (downScrolls / (downScrolls + upScrolls)) * 100 : 50;

  return {
    averageScrollDepth,
    maxScrollDepth,
    downScrolls,
    upScrolls,
    scrollRatio,
  };
}

// Helper function to calculate chart data
function calculateChartData(data: ScrollEvent[]) {
  const uniquePages = Array.from(new Set(data.map((item) => item.page_title)));

  // Scroll depth by page
  const scrollDepthByPage = uniquePages
    .map((page) => {
      const pageEvents = data.filter((event) => event.page_title === page);
      const avgDepth =
        pageEvents.length > 0
          ? pageEvents.reduce((acc, curr) => acc + curr.scroll_depth, 0) / pageEvents.length
          : 0;
      return {
        page,
        averageScrollDepth: avgDepth,
      };
    })
    .sort((a, b) => b.averageScrollDepth - a.averageScrollDepth);

  // Scroll depth distribution
  const scrollDepthDistribution = [
    {
      range: '0-25%',
      count: data.filter((item) => item.scroll_depth <= 25).length,
    },
    {
      range: '26-50%',
      count: data.filter((item) => item.scroll_depth > 25 && item.scroll_depth <= 50)
        .length,
    },
    {
      range: '51-75%',
      count: data.filter((item) => item.scroll_depth > 50 && item.scroll_depth <= 75)
        .length,
    },
    {
      range: '76-100%',
      count: data.filter((item) => item.scroll_depth > 75).length,
    },
  ];

  // Scroll direction distribution
  const { downScrolls, upScrolls } = calculateMetrics(data);
  const scrollDirectionData = [
    {
      id: 'Down Scrolls',
      label: 'Down Scrolls',
      value: downScrolls || 1,
    },
    { id: 'Up Scrolls', label: 'Up Scrolls', value: upScrolls || 1 },
  ];

  // Viewport ratio data
  const viewportRatioData = data.map((item) => ({
    id: item.event_id,
    x: item.viewport_height,
    y: Math.round((item.scroll_depth / 100) * item.document_height),
    page: item.page_title,
    viewportRatio: Math.round((item.viewport_height / item.document_height) * 100),
  }));

  // Heatmap data
  const heatmapData = uniquePages.map((page) => {
    const pageData = data.filter((item) => item.page_title === page);
    const downData = pageData.filter((i) => i.scroll_direction === 'down');
    const upData = pageData.filter((i) => i.scroll_direction === 'up');

    return {
      page,
      Down:
        downData.length > 0
          ? Math.round(
              downData.reduce((acc, curr) => acc + curr.scroll_depth, 0) / downData.length,
            )
          : 0,
      Up:
        upData.length > 0
          ? Math.round(
              upData.reduce((acc, curr) => acc + curr.scroll_depth, 0) / upData.length,
            )
          : 0,
    };
  });

  return {
    scrollDepthByPage,
    scrollDepthDistribution,
    scrollDirectionData,
    viewportRatioData,
    heatmapData,
  };
}

export function ScrollAnalytics({ data, dateRange }: ScrollAnalyticsProps) {
  const metrics = calculateMetrics(data);
  const chartData = calculateChartData(data);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {/* Summary metrics cards */}
      <div className="col-span-2 grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Avg. Scroll Depth</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {metrics.averageScrollDepth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">of page content viewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Max Scroll Depth</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics.maxScrollDepth}%</div>
            <p className="text-xs text-muted-foreground">deepest scroll recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Scroll Direction</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics.scrollRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">downward scrolls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">scroll events recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Scroll Depth by Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveBar
              data={chartData.scrollDepthByPage}
              keys={['averageScrollDepth']}
              indexBy="page"
              margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={{ scheme: 'nivo' }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Page',
                legendPosition: 'middle',
                legendOffset: 45,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Average Scroll Depth (%)',
                legendPosition: 'middle',
                legendOffset: -40,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              animate={true}
              motionStiffness={90}
              motionDamping={15}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scroll Direction Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsivePie
              data={chartData.scrollDirectionData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor={{ from: 'color' }}
              arcLinkLabelsThickness={1}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  translateY: 56,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  symbolSize: 18,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000',
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scroll Depth Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveBar
              data={chartData.scrollDepthDistribution}
              keys={['count']}
              indexBy="range"
              margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={{ scheme: 'nivo' }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Scroll Depth Range',
                legendPosition: 'middle',
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Events',
                legendPosition: 'middle',
                legendOffset: -40,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              animate={true}
              motionStiffness={90}
              motionDamping={15}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Viewport vs Scroll Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveScatterPlot
              data={[
                {
                  id: 'Scroll Events',
                  data: chartData.viewportRatioData,
                },
              ]}
              margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
              xScale={{ type: 'linear', min: 0, max: 'auto' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              blendMode="multiply"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Viewport Height',
                legendPosition: 'middle',
                legendOffset: 46,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Scroll Position',
                legendPosition: 'middle',
                legendOffset: -60,
              }}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 130,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 100,
                  itemHeight: 12,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
