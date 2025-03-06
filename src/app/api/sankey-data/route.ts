// app/api/sankey-data/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { SankeyChartProps } from "@/app/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") as string;
  const endDate = searchParams.get("endDate") as string;

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 },
    );
  }

  try {
    // Get MongoDB client and collection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "synchrony");
    const collection = db.collection("SankeyData");

    // Query MongoDB for sankey data within the date range
    const items = await collection
      .find({
        flow_date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();

    if (items.length > 0) {
      const sankeyData = items
        .map((item) => {
          const flowKey = item.flow_key;
          if (!flowKey) {
            console.warn("Missing flow_key in item:", item);
            return null;
          }

          const [source, target] = flowKey.split("->");
          const count = item.count;

          if (!source || !target || !count) {
            console.warn("Missing source, target, or count in item:", item);
            return null;
          }

          return {
            source: source,
            target: target,
            value: parseInt(count),
          };
        })
        .filter((item) => item !== null) as {
        source: string;
        target: string;
        value: number;
      }[];

      const aggregatedData = sankeyData.reduce(
        (acc, curr) => {
          const existingFlow = acc.find(
            (item) =>
              item.source === curr.source && item.target === curr.target,
          );
          if (existingFlow) {
            existingFlow.value += curr.value;
          } else {
            acc.push(curr);
          }
          return acc;
        },
        [] as { source: string; target: string; value: number }[],
      );

      const nodes = Array.from(
        new Set(aggregatedData.flatMap((item) => [item.source, item.target])),
      ).map((id) => ({ id }));

      const formattedData: SankeyChartProps = {
        nodes: nodes,
        links: aggregatedData,
      };
      return NextResponse.json(formattedData);
    } else {
      return NextResponse.json({ nodes: [], links: [] });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
