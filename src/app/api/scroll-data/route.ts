import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 100;

    // Get MongoDB client and collection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "synchrony");
    const scrollCollection = db.collection("ScrollEvents");

    // Create query object based on date parameters
    const query: { event_type: string; timestamp?: { $gte: number; $lte: number } } = { event_type: "scroll" };
    if (startDate && endDate) {
      // Convert dates to timestamps if needed
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      
      query.timestamp = {
        $gte: startTimestamp,
        $lte: endTimestamp,
      };
    }

    // Fetch data
    const scrollEvents = await scrollCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    return NextResponse.json(scrollEvents);
  } catch (error) {
    console.error("Error fetching scroll event data:", error);
    return NextResponse.json(
      { error: "Failed to fetch scroll event data" },
      { status: 500 }
    );
  }
}