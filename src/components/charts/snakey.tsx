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
import { GetSankeyData } from "@/app/api/synchrony-data-analytics";

// Define a config object for ChartContainer
const chartConfig: ChartConfig = {
  sankey: {
    label: "Sankey Flow",
    color: "hsl(var(--chart-1))",
  },
};

export async function SnakeyGraph() {
  const sankeyData = await GetSankeyData();
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
            margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
            align="justify"
            // colors={{ scheme: "nivo" }}
            colors={["#2a9d90", "#274754", "#f4a462", "#e8c468", "e76e50"]}
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
          Conversion rates increased by __% since Jan 2025{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing customer journey from Page 1 to Page 4
        </div>
      </CardFooter>
    </Card>
  );
}
