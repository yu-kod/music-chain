import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";

/**
 * 既存ノード・エッジの ID に yt: プレフィックスを付けるマイグレーション。
 * 既にプレフィックス付きのアイテムはスキップする。
 * 実行: npx tsx src/db/migrate-prefix.ts
 */
async function migrate() {
  console.log("=== Migrating node IDs to yt: prefix ===");

  // 1. ノードのマイグレーション
  const nodesResult = await scanAll(TABLES.nodes);
  let nodesMigrated = 0;
  for (const node of nodesResult) {
    const id = node.id as string;
    if (id.startsWith("yt:") || id.startsWith("sp:")) {
      continue;
    }
    const newId = `yt:${id}`;
    await docClient.send(
      new PutCommand({
        TableName: TABLES.nodes,
        Item: { ...node, id: newId },
      })
    );
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.nodes,
        Key: { id },
      })
    );
    console.log(`  Node: ${id} -> ${newId}`);
    nodesMigrated++;
  }
  console.log(`  Nodes migrated: ${nodesMigrated}`);

  // 2. エッジのマイグレーション
  const edgesResult = await scanAll(TABLES.edges);
  let edgesMigrated = 0;
  for (const edge of edgesResult) {
    const fromId = edge.from_node_id as string;
    const toId = edge.to_node_id as string;
    const newFromId = fromId.startsWith("yt:") || fromId.startsWith("sp:") ? fromId : `yt:${fromId}`;
    const newToId = toId.startsWith("yt:") || toId.startsWith("sp:") ? toId : `yt:${toId}`;

    if (newFromId === fromId && newToId === toId) {
      continue;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLES.edges,
        Item: { ...edge, from_node_id: newFromId, to_node_id: newToId },
      })
    );
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.edges,
        Key: { from_node_id: fromId, to_node_id: toId },
      })
    );
    console.log(`  Edge: (${fromId}, ${toId}) -> (${newFromId}, ${newToId})`);
    edgesMigrated++;
  }
  console.log(`  Edges migrated: ${edgesMigrated}`);

  console.log("=== Migration complete ===");
}

async function scanAll(tableName: string): Promise<Record<string, any>[]> {
  const items: Record<string, any>[] = [];
  let lastKey: Record<string, any> | undefined;
  do {
    const result = await docClient.send(
      new ScanCommand({ TableName: tableName, ExclusiveStartKey: lastKey })
    );
    items.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

migrate().catch(console.error);
