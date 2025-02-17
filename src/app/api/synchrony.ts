// pages/api/synchrony.ts
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

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

export async function GetEvents(eventType: string) {
  console.log("Fetching the data");
  if (!eventType) {
    return;
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
        ? response.Items.map((item) => unmarshall(item))
        : [];
      return items;
    }
  } catch (error: unknown) {
    console.error("Error:", error);
    return [];
  }
}
