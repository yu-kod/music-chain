import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";
import { batchGetNodes, type NodeItem } from "./nodes";

export interface EdgeItem {
  from_node_id: string;
  to_node_id: string;
  comments: string[];
  user_ids: string[];
  count: number;
  created_at: string;
}

export interface ConnectionItem extends NodeItem {
  comments: string[];
  connection_count: number;
}

export async function getEdge(
  fromNodeId: string,
  toNodeId: string
): Promise<EdgeItem | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.edges,
      Key: { from_node_id: fromNodeId, to_node_id: toNodeId },
    })
  );
  return (result.Item as EdgeItem) ?? null;
}

export async function createEdge(
  fromNodeId: string,
  toNodeId: string,
  comment: string,
  userId: string
): Promise<void> {
  const comments = comment ? [comment] : [];
  await docClient.send(
    new PutCommand({
      TableName: TABLES.edges,
      Item: {
        from_node_id: fromNodeId,
        to_node_id: toNodeId,
        comments,
        user_ids: [userId],
        count: 1,
        created_at: new Date().toISOString(),
      },
    })
  );
}

export async function appendToEdge(
  fromNodeId: string,
  toNodeId: string,
  comment: string,
  userId: string
): Promise<void> {
  const key = { from_node_id: fromNodeId, to_node_id: toNodeId };
  const exprNames = { "#cnt": "count" };

  if (comment) {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLES.edges,
        Key: key,
        UpdateExpression:
          "SET comments = list_append(comments, :newComments), user_ids = list_append(user_ids, :newUserIds), #cnt = #cnt + :one",
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: {
          ":newComments": [comment],
          ":newUserIds": [userId],
          ":one": 1,
        },
      })
    );
  } else {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLES.edges,
        Key: key,
        UpdateExpression:
          "SET user_ids = list_append(user_ids, :newUserIds), #cnt = #cnt + :one",
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: {
          ":newUserIds": [userId],
          ":one": 1,
        },
      })
    );
  }
}

async function queryAllEdges(
  params: ConstructorParameters<typeof QueryCommand>[0]
): Promise<EdgeItem[]> {
  const items: EdgeItem[] = [];
  let lastKey: Record<string, any> | undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({ ...params, ExclusiveStartKey: lastKey })
    );
    for (const item of result.Items ?? []) {
      items.push(item as EdgeItem);
    }
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

export async function getConnections(
  nodeId: string,
  limit: number
): Promise<ConnectionItem[]> {
  // from_node_id = nodeId のエッジ
  const fromEdges = await queryAllEdges({
    TableName: TABLES.edges,
    KeyConditionExpression: "from_node_id = :nodeId",
    ExpressionAttributeValues: { ":nodeId": nodeId },
  });

  // to_node_id = nodeId のエッジ（GSI）
  const toEdges = await queryAllEdges({
    TableName: TABLES.edges,
    IndexName: "gsi-to-node",
    KeyConditionExpression: "to_node_id = :nodeId",
    ExpressionAttributeValues: { ":nodeId": nodeId },
  });

  // connected_id ごとに集約
  const connectionMap = new Map<
    string,
    { comments: string[]; count: number }
  >();

  for (const edge of fromEdges) {
    const key = edge.to_node_id;
    const existing = connectionMap.get(key);
    if (existing) {
      existing.comments.push(...edge.comments);
      existing.count += edge.count;
    } else {
      connectionMap.set(key, {
        comments: [...edge.comments],
        count: edge.count,
      });
    }
  }

  for (const edge of toEdges) {
    const key = edge.from_node_id;
    const existing = connectionMap.get(key);
    if (existing) {
      existing.comments.push(...edge.comments);
      existing.count += edge.count;
    } else {
      connectionMap.set(key, {
        comments: [...edge.comments],
        count: edge.count,
      });
    }
  }

  // count DESC でソート、上位 N 件
  const sorted = [...connectionMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  if (sorted.length === 0) return [];

  // ノード詳細を一括取得
  const nodeIds = sorted.map(([id]) => id);
  const nodesMap = await batchGetNodes(nodeIds);

  return sorted
    .filter(([id]) => nodesMap.has(id))
    .map(([id, data]) => ({
      ...nodesMap.get(id)!,
      comments: data.comments,
      connection_count: data.count,
    }));
}

export async function getTotalConnectionCount(
  nodeId: string
): Promise<number> {
  const fromEdges = await queryAllEdges({
    TableName: TABLES.edges,
    KeyConditionExpression: "from_node_id = :nodeId",
    ExpressionAttributeValues: { ":nodeId": nodeId },
    ProjectionExpression: "#cnt",
    ExpressionAttributeNames: { "#cnt": "count" },
  });

  const toEdges = await queryAllEdges({
    TableName: TABLES.edges,
    IndexName: "gsi-to-node",
    KeyConditionExpression: "to_node_id = :nodeId",
    ExpressionAttributeValues: { ":nodeId": nodeId },
    ProjectionExpression: "#cnt",
    ExpressionAttributeNames: { "#cnt": "count" },
  });

  let total = 0;
  for (const edge of fromEdges) total += edge.count;
  for (const edge of toEdges) total += edge.count;
  return total;
}
