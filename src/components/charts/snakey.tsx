// app/components/SnakeyGraph.tsx
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SankeyClientWrapper from "./snakey-wrapper";
import { getSankeyData } from "@/app/lib/dynamodb";
import { format } from "date-fns";

export async function SnakeyGraph() {
  const defaultStartDate = format(new Date(), "2025-02-01");
  const defaultEndDate = format(new Date(), "2025-02-15");

  const initialSankeyData = await getSankeyData(
    defaultStartDate,
    defaultEndDate,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sankey Flow</CardTitle>
        <CardDescription>Synchrony Traffic Flow</CardDescription>
      </CardHeader>
      <CardContent className="">
        <SankeyClientWrapper initialData={initialSankeyData} />{" "}
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
