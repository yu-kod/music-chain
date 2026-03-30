import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";
import { getNodeById } from "./nodes";
import { getEdge } from "./edges";

const SEED_NODES = [
  { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up", channel: "Rick Astley" },
  { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE", channel: "officialpsy" },
  { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channel: "Luis Fonsi" },
  { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", channel: "Ed Sheeran" },
  { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth", channel: "Wiz Khalifa" },
  { id: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk ft. Bruno Mars", channel: "Mark Ronson" },
  { id: "hT_nvWreIhg", title: "OneRepublic - Counting Stars", channel: "OneRepublic" },
  { id: "YQHsXMglC9A", title: "Adele - Hello", channel: "Adele" },
  { id: "fJ9rUzIMcZQ", title: "Queen - Bohemian Rhapsody", channel: "Queen Official" },
  { id: "kXYiU_JCYtU", title: "Linkin Park - Numb", channel: "Linkin Park" },
];

const SEED_EDGES = [
  { from: "dQw4w9WgXcQ", to: "9bZkp7q19f0", comment: "80年代と2010年代のダンスポップ" },
  { from: "9bZkp7q19f0", to: "OPf0YbXqDm0", comment: "踊りたくなる曲つながり" },
  { from: "kJQP7kiw5Fk", to: "JGwWNGJdvx8", comment: "2017年のメガヒット同士" },
  { from: "fJ9rUzIMcZQ", to: "kXYiU_JCYtU", comment: "ロックの名曲" },
  { from: "YQHsXMglC9A", to: "RgKAFK5djSk", comment: "泣ける曲" },
];

async function seed() {
  console.log("Seeding DynamoDB...");

  for (const node of SEED_NODES) {
    const existing = await getNodeById(node.id);
    if (existing) {
      console.log(`  Skip: ${node.id} (already exists)`);
      continue;
    }
    await docClient.send(
      new PutCommand({
        TableName: TABLES.nodes,
        Item: {
          id: node.id,
          title: node.title,
          thumbnail_url: `https://img.youtube.com/vi/${node.id}/mqdefault.jpg`,
          channel_name: node.channel,
          created_at: new Date().toISOString(),
        },
      })
    );
    console.log(`  Added: ${node.title}`);
  }

  const seedUserId = "seed-user-00000000";
  for (const edge of SEED_EDGES) {
    const existing = await getEdge(edge.from, edge.to);
    if (existing) {
      console.log(`  Skip edge: ${edge.from} -> ${edge.to} (already exists)`);
      continue;
    }
    await docClient.send(
      new PutCommand({
        TableName: TABLES.edges,
        Item: {
          from_node_id: edge.from,
          to_node_id: edge.to,
          comments: [edge.comment],
          user_ids: [seedUserId],
          count: 1,
          created_at: new Date().toISOString(),
        },
      })
    );
    console.log(`  Edge: ${edge.from} -> ${edge.to}`);
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
