"server-only";
import { MongoClient } from "mongodb";
import { PageExitEvent, SankeyChartProps, ScrollEvent } from "./types";

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const EVENTS_COLLECTION = "UserInteractionEvents"; // Collection name for events
const SANKEY_COLLECTION = "SankeyData"; // Collection name for sankey data
const SCROLL_COLLECTION = "ScrollEvents"; // Collection name for scroll events

// MongoDB connection setup for server components
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getEvents(eventType: string): Promise<PageExitEvent[]> {
  if (!eventType) {
    return [];
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(EVENTS_COLLECTION);

    // Query MongoDB for events of the specified type
    const items = await collection
      .find({ event_type: String(eventType) })
      .toArray();

    // MongoDB already returns JSON objects, so no need for unmarshalling
    return items as unknown as PageExitEvent[];
  } catch (error: unknown) {
    console.error("Error fetching events from MongoDB:", error);
    return [];
  }
}

export interface ScrollEventQuery {
  startDate?: string;
  endDate?: string;
  pagePath?: string;
  limit: number;
}

// Define a proper type for MongoDB query with timestamp range
interface TimestampRange {
  $gte: number;
  $lte: number;
}

interface MongoScrollQuery {
  event_type: string;
  timestamp?: TimestampRange;
  page_path?: string;
}

export async function getScrollEvents(
  query: ScrollEventQuery,
): Promise<ScrollEvent[]> {
  try {
    const { startDate, endDate, pagePath, limit } = query;
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(SCROLL_COLLECTION);

    // Create query object based on date parameters
    const mongoQuery: MongoScrollQuery = { event_type: "scroll" };
    
    if (startDate && endDate) {
      // Convert dates to timestamps if needed
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      mongoQuery.timestamp = {
        $gte: startTimestamp,
        $lte: endTimestamp,
      };
    }
    
    if (pagePath) {
      mongoQuery.page_path = pagePath;
    }

    // Query MongoDB for scroll events
    const items = await collection
      .find(mongoQuery)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    // Properly type the return value
    return items as unknown as ScrollEvent[];
  } catch (error) {
    console.error("Error fetching scroll events from MongoDB:", error);
    return [];
  }
}


export async function getSankeyData(
  startDate: string,
  endDate: string,
): Promise<SankeyChartProps> {
  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(SANKEY_COLLECTION);

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
      return formattedData;
    } else {
      return { nodes: [], links: [] };
    }
  } catch (error) {
    console.error("Error querying data from MongoDB:", error);
    return { nodes: [], links: [] };
  }
}
