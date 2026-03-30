import { getDb } from "./schema";

// YouTube oEmbed APIが利用できない環境用にハードコードしたシードデータ
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

function seed() {
  const db = getDb();
  console.log("Seeding database...");

  for (const node of SEED_NODES) {
    const existing = db.prepare("SELECT id FROM nodes WHERE id = ?").get(node.id);
    if (existing) {
      console.log(`  Skip: ${node.id} (already exists)`);
      continue;
    }
    db.prepare(
      "INSERT INTO nodes (id, title, thumbnail_url, channel_name) VALUES (?, ?, ?, ?)"
    ).run(node.id, node.title, `https://img.youtube.com/vi/${node.id}/mqdefault.jpg`, node.channel);
    console.log(`  Added: ${node.title}`);
  }

  const seedEdges = [
    { from: "dQw4w9WgXcQ", to: "9bZkp7q19f0", comment: "80年代と2010年代のダンスポップ" },
    { from: "9bZkp7q19f0", to: "OPf0YbXqDm0", comment: "踊りたくなる曲つながり" },
    { from: "kJQP7kiw5Fk", to: "JGwWNGJdvx8", comment: "2017年のメガヒット同士" },
    { from: "fJ9rUzIMcZQ", to: "kXYiU_JCYtU", comment: "ロックの名曲" },
    { from: "YQHsXMglC9A", to: "RgKAFK5djSk", comment: "泣ける曲" },
  ];

  const seedUserId = "seed-user-00000000";
  for (const edge of seedEdges) {
    db.prepare(
      "INSERT OR IGNORE INTO edges (from_node_id, to_node_id, comment, user_id) VALUES (?, ?, ?, ?)"
    ).run(edge.from, edge.to, edge.comment, seedUserId);
    console.log(`  Edge: ${edge.from} → ${edge.to}`);
  }

  console.log("Seed complete!");
}

seed();
