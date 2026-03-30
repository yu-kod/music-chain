import {
  GetCommand,
  PutCommand,
  ScanCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";

export interface NodeItem {
  id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  created_at: string;
}

export async function getNodeById(id: string): Promise<NodeItem | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.nodes,
      Key: { id },
    })
  );
  return (result.Item as NodeItem) ?? null;
}

export async function createNode(
  node: Omit<NodeItem, "created_at">
): Promise<NodeItem> {
  const item: NodeItem = {
    ...node,
    created_at: new Date().toISOString(),
  };
  await docClient.send(
    new PutCommand({
      TableName: TABLES.nodes,
      Item: item,
    })
  );
  return item;
}

export async function getRandomNode(): Promise<NodeItem | null> {
  const allIds: string[] = [];
  let lastKey: Record<string, any> | undefined;

  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.nodes,
        ProjectionExpression: "id",
        ExclusiveStartKey: lastKey,
      })
    );
    for (const item of result.Items ?? []) {
      allIds.push(item.id as string);
    }
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  if (allIds.length === 0) return null;

  const randomId = allIds[Math.floor(Math.random() * allIds.length)];
  return getNodeById(randomId);
}

export async function batchGetNodes(
  ids: string[]
): Promise<Map<string, NodeItem>> {
  const map = new Map<string, NodeItem>();
  if (ids.length === 0) return map;

  // BatchGetItem は最大100件
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) {
    chunks.push(ids.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const result = await docClient.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLES.nodes]: {
            Keys: chunk.map((id) => ({ id })),
          },
        },
      })
    );
    for (const item of result.Responses?.[TABLES.nodes] ?? []) {
      map.set(item.id as string, item as NodeItem);
    }
  }

  return map;
}
