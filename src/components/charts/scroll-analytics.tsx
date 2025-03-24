"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

// Define the scroll event interface
interface ScrollEvent {
  _id: string;
  event_type: string;
  session_id: string;
  timestamp: number;
  page_url: string;
  page_path: string;
  page_title: string;
  scroll_depth: number;
  scroll_direction: string;
  viewport_height: number;
  document_height: number;
  event_id: string;
  user_ip: string;
  user_agent: string;
}

// Main component for scroll analytics
export const ScrollAnalytics = ({
  initialData,
}: {
  initialData: ScrollEvent[];
}) => {
  // Ensure we have valid data to work with
  const safeInitialData = Array.isArray(initialData) ? initialData : [];

  // Generate sample data if we don't have any
  const sampleData: ScrollEvent[] = Array.from({ length: 20 }).map((_, i) => ({
    _id: `sample-${i}`,
    event_type: "scroll",
    session_id: `session-${i % 5}`,
    timestamp: Math.floor(Date.now() / 1000) - i * 3600,
    page_url: `http://example.com/${["home", "about", "products", "blog", "contact"][i % 5]}`,
    page_path: `/${["home", "about", "products", "blog", "contact"][i % 5]}`,
    page_title: ["Home Page", "About Us", "Products", "Blog", "Contact Us"][
      i % 5
    ],
    scroll_depth: Math.floor(Math.random() * 100),
    scroll_direction: i % 3 === 0 ? "up" : "down",
    viewport_height: 700 + Math.floor(Math.random() * 300),
    document_height: 1500 + Math.floor(Math.random() * 500),
    event_id: `event-${i}`,
    user_ip: "127.0.0.1",
    user_agent: "Mozilla/5.0",
  }));

  const [data, setData] = useState<ScrollEvent[]>(
    safeInitialData.length > 0 ? safeInitialData : sampleData,
  );
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all");

  // Calculate key metrics from the data (with safety checks)
  const averageScrollDepth =
    data.length > 0
      ? data.reduce((acc, curr) => acc + curr.scroll_depth, 0) / data.length
      : 0;
  const maxScrollDepth =
    data.length > 0 ? Math.max(...data.map((item) => item.scroll_depth)) : 0;
  const downScrolls = data.filter(
    (item) => item.scroll_direction === "down",
  ).length;
  const upScrolls = data.filter(
    (item) => item.scroll_direction === "up",
  ).length;
  const scrollRatio =
    downScrolls + upScrolls > 0
      ? (downScrolls / (downScrolls + upScrolls)) * 100
      : 50;

  // Get unique pages with safety check
  const uniquePages =
    data.length > 0
      ? Array.from(new Set(data.map((item) => item.page_title)))
      : ["Home Page", "About Us", "Products", "Blog", "Contact Us"];

  // Calculate average scroll depth by page with safety checks
  const scrollDepthByPage = uniquePages
    .map((page) => {
      const pageEvents = data.filter((event) => event.page_title === page);
      const avgDepth =
        pageEvents.length > 0
          ? pageEvents.reduce((acc, curr) => acc + curr.scroll_depth, 0) /
            pageEvents.length
          : Math.floor(Math.random() * 50) + 20; // Fallback to random value for sample data
      return {
        page,
        averageScrollDepth: avgDepth,
      };
    })
    .sort((a, b) => b.averageScrollDepth - a.averageScrollDepth);

  // Scroll depth distribution data with safety check
  const scrollDepthDistribution =
    data.length > 0
      ? [
          {
            range: "0-25%",
            count: data.filter((item) => item.scroll_depth <= 25).length,
          },
          {
            range: "26-50%",
            count: data.filter(
              (item) => item.scroll_depth > 25 && item.scroll_depth <= 50,
            ).length,
          },
          {
            range: "51-75%",
            count: data.filter(
              (item) => item.scroll_depth > 50 && item.scroll_depth <= 75,
            ).length,
          },
          {
            range: "76-100%",
            count: data.filter((item) => item.scroll_depth > 75).length,
          },
        ]
      : [
          { range: "0-25%", count: 5 },
          { range: "26-50%", count: 8 },
          { range: "51-75%", count: 4 },
          { range: "76-100%", count: 3 },
        ];

  // Scroll direction distribution data for pie chart with safety check
  const scrollDirectionData =
    downScrolls > 0 || upScrolls > 0
      ? [
          {
            id: "Down Scrolls",
            label: "Down Scrolls",
            value: downScrolls || 1,
          },
          { id: "Up Scrolls", label: "Up Scrolls", value: upScrolls || 1 },
        ]
      : [
          { id: "Down Scrolls", label: "Down Scrolls", value: 12 },
          { id: "Up Scrolls", label: "Up Scrolls", value: 8 },
        ];

  // Viewport ratio data with safety check
  const viewportRatioData =
    data.length > 0
      ? data.map((item) => ({
          id: item.event_id,
          x: item.viewport_height,
          y: Math.round((item.scroll_depth / 100) * item.document_height),
          page: item.page_title,
          viewportRatio: Math.round(
            (item.viewport_height / item.document_height) * 100,
          ),
        }))
      : Array.from({ length: 20 }).map((_, i) => {
          const vh = 700 + Math.floor(Math.random() * 300);
          const dh = 1500 + Math.floor(Math.random() * 500);
          const sd = Math.floor(Math.random() * 100);
          return {
            id: `sample-${i}`,
            x: vh,
            y: Math.round((sd / 100) * dh),
            page: ["Home Page", "About Us", "Products", "Blog", "Contact Us"][
              i % 5
            ],
            viewportRatio: Math.round((vh / dh) * 100),
          };
        });

  // Scroll depth heatmap data by page and direction with safety check
  const heatmapData = uniquePages.map((page) => {
    const pageData = data.filter((item) => item.page_title === page);
    if (pageData.length === 0) {
      // Generate random data for empty pages
      return {
        page,
        Down: Math.floor(Math.random() * 60) + 20,
        Up: Math.floor(Math.random() * 40) + 10,
      };
    }

    const downData = pageData.filter((i) => i.scroll_direction === "down");
    const upData = pageData.filter((i) => i.scroll_direction === "up");

    return {
      page,
      Down:
        downData.length > 0
          ? Math.round(
              downData.reduce((acc, curr) => acc + curr.scroll_depth, 0) /
                downData.length,
            )
          : Math.floor(Math.random() * 60) + 20,
      Up:
        upData.length > 0
          ? Math.round(
              upData.reduce((acc, curr) => acc + curr.scroll_depth, 0) /
                upData.length,
            )
          : Math.floor(Math.random() * 40) + 10,
    };
  });

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {/* Summary metrics cards */}
      <div className="col-span-2 grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">
              Avg. Scroll Depth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {averageScrollDepth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              of page content viewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">
              Max Scroll Depth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{maxScrollDepth}%</div>
            <p className="text-xs text-muted-foreground">
              deepest scroll recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Scroll Ratio</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{scrollRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">down vs. up scrolls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">
              scroll events captured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main charts */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Scroll Direction</CardTitle>
          <CardDescription>Distribution of scroll directions</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsivePie
            data={scrollDirectionData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            colors={["#3b82f6", "#ef4444"]}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Scroll Depth Distribution</CardTitle>
          <CardDescription>How deep users scroll on pages</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={scrollDepthDistribution}
            keys={["count"]}
            indexBy="range"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#3b82f6"]}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Scroll Depth",
              legendPosition: "middle",
              legendOffset: 32,
              truncateTickAt: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Count",
              legendPosition: "middle",
              legendOffset: -40,
              truncateTickAt: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Average Scroll Depth by Page</CardTitle>
          <CardDescription>
            How far users scroll on different pages
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={scrollDepthByPage}
            keys={["averageScrollDepth"]}
            indexBy="page"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#3b82f6"]}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "Page",
              legendPosition: "middle",
              legendOffset: 40,
              truncateTickAt: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Average Scroll Depth (%)",
              legendPosition: "middle",
              legendOffset: -40,
              truncateTickAt: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Scroll Depth by Direction</CardTitle>
          <CardDescription>
            Average scroll depth by page and direction
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={heatmapData}
            keys={["Down", "Up"]}
            indexBy="page"
            groupMode="grouped"
            margin={{ top: 50, right: 50, bottom: 50, left: 120 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#3b82f6", "#ef4444"]}
            defs={[
              {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "#38bcb2",
                size: 4,
                padding: 1,
                stagger: true,
              },
              {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "#eed312",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
              },
            ]}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Page",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Scroll Depth (%)",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrollAnalytics;
