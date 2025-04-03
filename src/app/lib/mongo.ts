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
const PERFORMANCE_COLLECTION = "PerformanceEvents";

// MongoDB connection setup for server components
let cachedClient: MongoClient | null = null;
let isConnecting = false;

async function connectToDatabase() {
  if (cachedClient) {
    try {
      // Test if the connection is still alive
      await cachedClient.db(MONGODB_DB_NAME).command({ ping: 1 });
      return cachedClient;
    } catch (error) {
      console.log("Cached connection failed, creating new connection");
      cachedClient = null;
    }
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (isConnecting) {
    // Wait for the existing connection attempt to complete
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (cachedClient) {
      return cachedClient;
    }
  }

  isConnecting = true;
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    cachedClient = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

// Add a cleanup function to properly close the connection
export async function closeDatabaseConnection() {
  if (cachedClient) {
    try {
      await cachedClient.close();
      cachedClient = null;
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
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
const eventCollectionMap: Record<string, string> = {
  "scroll": SCROLL_COLLECTION,
  "click": CLICK_COLLECTION,
  "performance": PERFORMANCE_COLLECTION,
  "page_exit": PAGE_EXIT_COLLECTION,
}
export async function getEvents<T extends BaseEventData>(
  query: EventQuery,
): Promise<T[]> {
  try {
    const { startDate, endDate, pagePath, limit } = query;
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB_NAME);
    const collectionName = eventCollectionMap[query.eventType];
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

// Counts unique sessions visiting a specific page within a date range using aggregation
export async function getTotalPageVisitors(
  startDate: string,
  endDate: string,
  pagePath: string,
): Promise<number> {
  let client: MongoClient | undefined;
  try {
    client = await connectToDatabase();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(PERFORMANCE_COLLECTION);

    // Convert input dates to Unix timestamps (seconds)
    const { startISOString, endISOString } = convertToISOString(startDate, endDate);
    // Define the aggregation pipeline with corrected field names and timestamp comparison
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startISOString,
            $lte: endISOString
          },
          page_path: pagePath,
          session_id: { $exists: true, $ne: null } // Corrected field name: session_id
        }
      },
      // Stage 2: Group by session_id to find unique sessions
      {
        $group: {
          _id: '$session_id' // Corrected field name: session_id
        }
      },
      // Stage 3: Count the number of unique groups (unique sessions)
      {
        $count: 'uniqueSessionCount'
      }
    ];


    const result = await collection.aggregate(pipeline).toArray();

    let count = 0;
    if (result.length > 0) {
      count = result[0].uniqueSessionCount;
    }

    return count;

  } catch (error) {
    console.error("Error counting unique page visitors via aggregation:", error);
    return 0;
  } finally {
    if (client) {
      await client.close();
    }
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

// Get all unique page paths within a date range
export async function getPagePaths(
startDate: string,
endDate: string,
): Promise<string[]> {
let client: MongoClient | undefined;
try {
  client = await connectToDatabase();
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection(PERFORMANCE_COLLECTION);

  // Convert input dates to Unix timestamps (seconds)
  const { startISOString, endISOString } = convertToISOString(startDate, endDate);

  // Define the date range query using seconds
  const query = {
    timestamp: { // Compare against the integer timestamp field
      $gte: startISOString,       // Greater than or equal to start (seconds)
      $lt: endISOString // Less than the start of the next day (seconds)
    },
  };

  console.log("Query for distinct page paths:", JSON.stringify(query, null, 2));

  // Use the distinct method
  const distinctPagePaths = await collection.distinct('page_path', query);

  if (!Array.isArray(distinctPagePaths)) {
      console.error("MongoDB distinct query did not return an array.");
      return [];
  }

  // Filter out any non-string values
  const stringPaths = distinctPagePaths.filter(
      (path): path is string => typeof path === 'string' && path !== null && path !== undefined
  );

  console.log("Distinct page paths found:", stringPaths);
  return stringPaths;

} catch (error) {
  console.error("Error querying distinct page paths from MongoDB:", error);
  return []; // Return empty array on error
} finally {
    if (client) {
        await client.close();
    }
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