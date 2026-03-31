import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";
import { getNodeById } from "./nodes";
import { getEdge } from "./edges";

const SEED_NODES = [
  { id: "yt:dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up", channel: "Rick Astley" },
  { id: "yt:9bZkp7q19f0", title: "PSY - GANGNAM STYLE", channel: "officialpsy" },
  { id: "yt:kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channel: "Luis Fonsi" },
  { id: "yt:JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", channel: "Ed Sheeran" },
  { id: "yt:RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth", channel: "Wiz Khalifa" },
  { id: "yt:OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk ft. Bruno Mars", channel: "Mark Ronson" },
  { id: "yt:hT_nvWreIhg", title: "OneRepublic - Counting Stars", channel: "OneRepublic" },
  { id: "yt:YQHsXMglC9A", title: "Adele - Hello", channel: "Adele" },
  { id: "yt:fJ9rUzIMcZQ", title: "Queen - Bohemian Rhapsody", channel: "Queen Official" },
  { id: "yt:kXYiU_JCYtU", title: "Linkin Park - Numb", channel: "Linkin Park" },
];

const SEED_EDGES = [
  { from: "yt:dQw4w9WgXcQ", to: "yt:9bZkp7q19f0", comment: "80年代と2010年代のダンスポップ" },
  { from: "yt:9bZkp7q19f0", to: "yt:OPf0YbXqDm0", comment: "踊りたくなる曲つながり" },
  { from: "yt:kJQP7kiw5Fk", to: "yt:JGwWNGJdvx8", comment: "2017年のメガヒット同士" },
  { from: "yt:fJ9rUzIMcZQ", to: "yt:kXYiU_JCYtU", comment: "ロックの名曲" },
  { from: "yt:YQHsXMglC9A", to: "yt:RgKAFK5djSk", comment: "泣ける曲" },
];

function thumbnailUrl(id: string): string {
  const rawId = id.replace(/^yt:/, "");
  return `https://img.youtube.com/vi/${rawId}/mqdefault.jpg`;
}

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
          thumbnail_url: thumbnailUrl(node.id),
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
