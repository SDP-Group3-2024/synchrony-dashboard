"use server";
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { PageExitEvent, SankeyChartProps } from "./types";
import { Sankey } from "recharts";

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

export async function getEvents(eventType: string): Promise<PageExitEvent[]> {
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

export async function getSankeyData(
  startDate: string,
  endDate: string,
): Promise<SankeyChartProps> {
  const params = {
    TableName: "sankey-data",
    KeyConditionExpression: "flow_date BETWEEN :start_date AND :end_date",
    ExpressionAttributeValues: {
      ":start_date": { S: startDate },
      ":end_date": { S: endDate },
    },
  };

  try {
    const command = new QueryCommand(params);
    const response = await client.send(command);

    if (response.Items) {
      const sankeyData = response.Items.map((item) => {
        const flowKey = item.flow_key?.S;
        if (!flowKey) {
          console.warn("Missing flow_key in item:", item);
          return null;
        }

        const [source, target] = flowKey.split("->");
        const count = item.count?.N;

        if (!source || !target || !count) {
          console.warn("Missing source, target, or count in item:", item);
          return null;
        }

        return {
          source: source,
          target: target,
          value: parseInt(count),
        };
      }).filter((item) => item !== null) as {
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
    console.error("Error querying data:", error);
    return { nodes: [], links: [] };
  }
}

async function pushInitialData(
  data: SankeyChartProps,
  startDate: string,
  endDate: string,
): Promise<void> {
  const links = data.links;

  // Calculate the number of days between the start and end dates
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const timeDiff = endDateObj.getTime() - startDateObj.getTime();
  const numDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

  for (let i = 0; i < numDays; i++) {
    // Calculate the date for the current iteration
    const currentDateObj = new Date(startDateObj);
    currentDateObj.setDate(startDateObj.getDate() + i);
    const currentDate = currentDateObj.toISOString().slice(0, 10);

    for (const link of links) {
      // Enforce a direction to prevent circular links
      if (
        data.nodes.findIndex((node) => node.id === link.source) >
        data.nodes.findIndex((node) => node.id === link.target)
      ) {
        console.warn(
          `Skipping link ${link.source} -> ${link.target} to prevent circular link`,
        );
        continue; // Skip this link
      }

      const flowKey = `${link.source}->${link.target}`;

      // Introduce some randomness to the daily value
      const baseDailyValue = link.value / numDays;
      const randomFactor = Math.random() * 0.4 - 0.2;
      const dailyValue = Math.floor(baseDailyValue * (1 + randomFactor));

      // Ensure dailyValue is not negative
      const finalDailyValue = Math.max(0, dailyValue);

      const params = {
        TableName: "sankey-data",
        Item: {
          flow_date: { S: currentDate },
          flow_key: { S: flowKey },
          count: { N: finalDailyValue.toString() },
        },
      };

      try {
        const command = new PutItemCommand(params);
        await client.send(command);
        console.log(
          `Successfully pushed data for ${flowKey} on ${currentDate} with value ${finalDailyValue}`,
        );
      } catch (error) {
        console.error(
          `Error pushing data for ${flowKey} on ${currentDate}:`,
          error,
        );
      }
    }
  }
}

// Sample data
const sankeyData: SankeyChartProps = {
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

// Example usage:
const startDate = "2025-01-20"; // Two weeks ago from today
const endDate = "2025-02-20"; // Today

pushInitialData(sankeyData, startDate, endDate);
