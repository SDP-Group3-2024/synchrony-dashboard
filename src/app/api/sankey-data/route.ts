// app/api/sankey-data/route.ts
import { NextResponse } from "next/server";
import { getSankeyData } from "@/app/lib/dynamodb";

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
    const data = await getSankeyData(startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
