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

export async function getSankeyData(
  startDate: string,
  endDate: string,
): Promise<SankeyChartProps> {
  const params = {
    TableName: "sankey-data",
    KeyConditionExpression: "date BETWEEN :start_date AND :end_date",
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
