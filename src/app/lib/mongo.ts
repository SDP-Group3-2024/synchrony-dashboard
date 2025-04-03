"server-only";
import { MongoClient } from "mongodb";
import { EventType, SankeyChartProps, BaseEventData } from "./types";

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const SANKEY_COLLECTION = "SankeyData"; 
const SCROLL_COLLECTION = "ScrollEvents";
const CLICK_COLLECTION = "ClickEvents";
const PAGE_EXIT_COLLECTION = "PageEvents";
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

export interface EventQuery {
  eventType: EventType;
  startDate?: string;
  endDate?: string;
  pagePath?: string;
  limit: number;
}

// Define a proper type for MongoDB query with timestamp range
interface TimestampRange {
  $gte: string;
  $lte: string;
}

interface MongoEventQuery {
  timestamp?: TimestampRange;
  page_path?: string;
}

export async function getEvents<T extends BaseEventData>(
  query: EventQuery,
): Promise<T[]> {
  try {
    const { startDate, endDate, pagePath, limit } = query;
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB_NAME);
    const collectionName = query.eventType === "scroll" ? SCROLL_COLLECTION : CLICK_COLLECTION;
    const collection = db.collection(collectionName);

    // Create query object based on date parameters
    const mongoQuery: MongoEventQuery = {  };
    
    if (startDate && endDate) {
      const { startISOString, endISOString } = convertToISOString(startDate, endDate);
      mongoQuery.timestamp = {
        $gte: startISOString,
        $lte: endISOString,
      };
    }
    
    if (pagePath) {
      mongoQuery.page_path = pagePath;
    }

    console.log("MongoDB query:", JSON.stringify(mongoQuery, null, 2));

    const items = await collection
      .find(mongoQuery)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    console.log(`Found ${items.length} ${query.eventType} events`);
    
    return items as unknown as T[];
  } catch (error) {
    console.error(`Error fetching ${query.eventType} events from MongoDB:`, error);
    return [];
  }
}
// TODO: Fix
export async function getTotalPageVisitors(
  startDate: string,
  endDate: string,
  pagePath: string,
): Promise<number> {
  const client = await connectToDatabase();
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection(PAGE_EXIT_COLLECTION);
  const { startISOString, endISOString } = convertToISOString(startDate, endDate);
  const query: MongoEventQuery = {
    timestamp: {
      $gte: startISOString,
      $lte: endISOString,
    },
    page_path: pagePath,
  };
  console.log("Page event query:", JSON.stringify(query, null, 2));
  const count = await collection
    .countDocuments(query);
  console.log("Total page visitors:", count);
  return count;
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

function convertToISOString(startDate: string, endDate: string): { startISOString: string, endISOString: string } {
  // Convert to ISO date strings to match the format in the database
  const startISOString = new Date(startDate).toISOString();
  // Make the end date inclusive by setting it to the end of the day (23:59:59.999)
  const endDateObj = new Date(endDate);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const endISOString = endDateObj.toISOString();
  return { startISOString, endISOString };
}
