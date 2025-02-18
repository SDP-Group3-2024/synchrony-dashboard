"use server";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { PageExitEvent, SankeyChartProps } from "./types";

// Load environment variables
const region = process.env.AWS_REGION;
const tableName = process.env.ANALYTICS_DATA_TABLE_NAME;

// Configure the DynamoDB client
const client = new DynamoDBClient({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!,
  },
});

export async function GetEvents(eventType: string): Promise<PageExitEvent[]> {
  console.log("Fetching the data");
  if (!eventType) {
    return [];
  }
  try {
    if (eventType) {
      const params = {
        TableName: tableName,
        KeyConditionExpression: "event_type = :event_type",
        ExpressionAttributeValues: {
          ":event_type": { S: String(eventType) },
        },
      };

      const command = new QueryCommand(params);
      const response = await client.send(command);
      // Unmarshall the items
      const items = response.Items
        ? response.Items.map((item) => unmarshall(item) as PageExitEvent)
        : [];
      return items;
    }
  } catch (error: unknown) {
    console.error("Error:", error);
  }
  return [];
}

export async function GetSankeyData(): Promise<SankeyChartProps> {
  // In the future, this will come from a database.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    nodes: [
      { id: "Page 1" },
      { id: "Page 2" },
      { id: "Page 3" },
      { id: "Page 4" },
      { id: "Page 5" },
      { id: "User Exit" },
    ],
    links: [
      { source: "Page 1", target: "Page 2", value: 200 },
      { source: "Page 1", target: "Page 3", value: 150 },
      { source: "Page 1", target: "Page 4", value: 150 },
      { source: "Page 2", target: "Page 3", value: 50 },
      { source: "Page 2", target: "Page 4", value: 50 },
      { source: "Page 2", target: "Page 5", value: 50 },
      { source: "Page 3", target: "Page 4", value: 120 },
      { source: "Page 3", target: "Page 5", value: 120 },
      { source: "Page 4", target: "Page 5", value: 60 },
      { source: "Page 2", target: "User Exit", value: 30 },
      { source: "Page 1", target: "User Exit", value: 70 },
      { source: "Page 3", target: "User Exit", value: 10 },
      { source: "Page 4", target: "User Exit", value: 8 },
    ],
  };
}
