"use server";
import { MongoClient } from "mongodb";
import { PageExitEvent, SankeyChartProps } from "./types";

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const EVENTS_COLLECTION = "UserInteractionEvents"; // Collection name for events
const SANKEY_COLLECTION = "SankeyData"; // Collection name for sankey data

// MongoDB connection setup
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
    return items as PageExitEvent[];
  } catch (error: unknown) {
    console.error("Error fetching events from MongoDB:", error);
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
      console.log(formattedData);
      return formattedData;
    } else {
      return { nodes: [], links: [] };
    }
  } catch (error) {
    console.error("Error querying data from MongoDB:", error);
    return { nodes: [], links: [] };
  }
}
