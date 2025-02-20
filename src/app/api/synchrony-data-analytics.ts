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
    accessKeyId: process.env.aws_access_key_id!,
    secretAccessKey: process.env.aws_secret_access_key!,
    sessionToken: process.env.aws_session_token!,
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
      { id: "Homepage" },
      { id: "Product Overview" },
      { id: "Rates & Fees" },
      { id: "Find a Branch/ATM" },
      { id: "About Us" },
      { id: "Login Page" },
      { id: "New Account Signup" },
      { id: "Account Summary" },
      { id: "User Exit" },
    ],
    links: [
      { source: "Homepage", target: "Product Overview", value: 500 },
      { source: "Homepage", target: "Rates & Fees", value: 300 },
      { source: "Homepage", target: "Find a Branch/ATM", value: 200 },
      { source: "Homepage", target: "About Us", value: 100 },
      { source: "Homepage", target: "Login Page", value: 400 },
      { source: "Homepage", target: "New Account Signup", value: 250 },
      { source: "Homepage", target: "User Exit", value: 150 },
      { source: "Product Overview", target: "Rates & Fees", value: 250 },
      { source: "Product Overview", target: "New Account Signup", value: 300 },
      { source: "Rates & Fees", target: "New Account Signup", value: 150 },
      { source: "Login Page", target: "Account Summary", value: 350 },
      { source: "Login Page", target: "User Exit", value: 50 },
      { source: "New Account Signup", target: "User Exit", value: 100 },
      { source: "Product Overview", target: "User Exit", value: 50 },
      { source: "Rates & Fees", target: "User Exit", value: 30 },
      { source: "Find a Branch/ATM", target: "User Exit", value: 20 },
      { source: "About Us", target: "User Exit", value: 10 },
    ],
  };
}
