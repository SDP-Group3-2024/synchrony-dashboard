import { TrendingUp } from "lucide-react";

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
import SankeyClientWrapper from "./snakey-wrapper";

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
          <SankeyClientWrapper data={sankeyData} />
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
