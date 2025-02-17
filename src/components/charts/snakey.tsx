"use client";

import { TrendingUp } from "lucide-react";
import { ResponsiveSankey } from "@nivo/sankey";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// Define a config object for ChartContainer
const chartConfig: ChartConfig = {
  sankey: {
    label: "Sankey Flow",
    color: "hsl(var(--chart-1))",
  },
};

const sankeyData = {
    nodes: [
      { id: "Page 1" },
      { id: "Page 2" },
      { id: "Page 3" },
      { id: "Page 4" },
    ],
    links: [
      { source: "Page 1", target: "Page 2", value: 200 },
      { source: "Page 1", target: "Page 3", value: 150 },
      { source: "Page 1", target: "Page 4", value: 150 },
      { source: "Page 2", target: "Page 3", value: 50 },
      { source: "Page 2", target: "Page 4", value: 50 },
      { source: "Page 3", target: "Page 4", value: 120 },
    ],
  };
  

export function SnakeyGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sankey Flow</CardTitle>
        <CardDescription>Synchrony Traffic Flow</CardDescription>
      </CardHeader>
      <CardContent className="">
        <ChartContainer config={chartConfig}>
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 40, right: 50, bottom: 40, left: 50 }}
            align="justify"
            // colors={{ scheme: "nivo" }}
            colors = {['#2a9d90','#274754','#f4a462','#e8c468', 'e76e50']}
            nodeOpacity={1}
            nodeThickness={18}
            nodeBorderWidth={1}
            nodeBorderColor={{ from: "color", modifiers: [["darker", 0.8]] }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
          />
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Conversion rates increased by __% since Jan 2025 <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing customer journey from Page 1 to Page 4
        </div>
      </CardFooter>
    </Card>
  );
}
