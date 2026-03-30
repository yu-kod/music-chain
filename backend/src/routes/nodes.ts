import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";
import { extractVideoId, fetchVideoInfo } from "../services/youtube";

const router = Router();

// GET /api/nodes/random - ランダムなノードを1つ返す
router.get("/random", (_req: Request, res: Response) => {
  const db = getDb();
  const node = db
    .prepare("SELECT * FROM nodes ORDER BY RANDOM() LIMIT 1")
    .get();
  if (!node) {
    res.status(404).json({ error: "No nodes available" });
    return;
  }
  res.json(node);
});

// GET /api/nodes/:id - ノード詳細 + 接続ノード
router.get("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const node = db.prepare("SELECT * FROM nodes WHERE id = ?").get(req.params.id);
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  // 接続されているノード（from/to両方向）をつながり数順で最大10件
  const connections = db
    .prepare(
      `
      SELECT n.*, e.comment, e.user_id as edge_user_id, e.created_at as edge_created_at,
             cnt.connection_count
      FROM (
        SELECT to_node_id AS connected_id, comment, user_id, created_at
        FROM edges WHERE from_node_id = ?
        UNION ALL
        SELECT from_node_id AS connected_id, comment, user_id, created_at
        FROM edges WHERE to_node_id = ?
      ) e
      JOIN nodes n ON n.id = e.connected_id
      LEFT JOIN (
        SELECT connected_id, COUNT(*) as connection_count FROM (
          SELECT to_node_id AS connected_id FROM edges WHERE from_node_id = ?
          UNION ALL
          SELECT from_node_id AS connected_id FROM edges WHERE to_node_id = ?
        ) GROUP BY connected_id
      ) cnt ON cnt.connected_id = n.id
      ORDER BY cnt.connection_count DESC
      LIMIT 10
      `
    )
    .all(req.params.id, req.params.id, req.params.id, req.params.id);

  res.json({ node, connections });
});

// POST /api/nodes - 曲を単体登録
router.post("/", async (req: Request, res: Response) => {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl) {
    res.status(400).json({ error: "youtubeUrl is required" });
    return;
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    res.status(400).json({ error: "Invalid YouTube URL" });
    return;
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM nodes WHERE id = ?").get(videoId);
  if (existing) {
    res.json({ node: existing, isNew: false });
    return;
  }

  try {
    const info = await fetchVideoInfo(videoId);
    db.prepare(
      "INSERT INTO nodes (id, title, thumbnail_url, channel_name) VALUES (?, ?, ?, ?)"
    ).run(videoId, info.title, info.thumbnailUrl, info.channelName);
    const node = db.prepare("SELECT * FROM nodes WHERE id = ?").get(videoId);
    res.status(201).json({ node, isNew: true });
  } catch {
    res.status(400).json({ error: "Failed to fetch YouTube video info" });
  }
});

export default router;
