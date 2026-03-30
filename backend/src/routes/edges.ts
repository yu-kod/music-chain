import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";
import { extractVideoId, fetchVideoInfo } from "../services/youtube";

const router = Router();

// POST /api/edges - エッジ（つながり）を作成
router.post("/", async (req: Request, res: Response) => {
  const { fromNodeId, youtubeUrl, comment } = req.body;
  const userId = req.userId;

  if (!fromNodeId || !youtubeUrl || !comment) {
    res.status(400).json({ error: "fromNodeId, youtubeUrl, comment are required" });
    return;
  }

  if (comment.length > 30) {
    res.status(400).json({ error: "Comment must be 30 characters or less" });
    return;
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    res.status(400).json({ error: "Invalid YouTube URL" });
    return;
  }

  const db = getDb();

  // 起点ノードの存在確認
  const fromNode = db.prepare("SELECT * FROM nodes WHERE id = ?").get(fromNodeId);
  if (!fromNode) {
    res.status(404).json({ error: "From node not found" });
    return;
  }

  // 終点ノードの取得 or 作成
  let toNode = db.prepare("SELECT * FROM nodes WHERE id = ?").get(videoId) as any;
  let isNewNode = false;

  if (!toNode) {
    try {
      const info = await fetchVideoInfo(videoId);
      db.prepare(
        "INSERT INTO nodes (id, title, thumbnail_url, channel_name) VALUES (?, ?, ?, ?)"
      ).run(videoId, info.title, info.thumbnailUrl, info.channelName);
      toNode = db.prepare("SELECT * FROM nodes WHERE id = ?").get(videoId);
      isNewNode = true;
    } catch {
      res.status(400).json({ error: "Failed to fetch YouTube video info" });
      return;
    }
  }

  // 同一ユーザーの同一エッジ重複チェック
  const existing = db
    .prepare(
      "SELECT * FROM edges WHERE from_node_id = ? AND to_node_id = ? AND user_id = ?"
    )
    .get(fromNodeId, videoId, userId);
  if (existing) {
    res.status(409).json({ error: "You already connected these songs" });
    return;
  }

  // エッジ作成
  db.prepare(
    "INSERT INTO edges (from_node_id, to_node_id, comment, user_id) VALUES (?, ?, ?, ?)"
  ).run(fromNodeId, videoId, comment, userId);

  // 接続ノード一覧を取得（投稿先ノードに接続されているノード）
  const connections = db
    .prepare(
      `
      SELECT DISTINCT n.*, e.comment, cnt.connection_count
      FROM (
        SELECT to_node_id AS connected_id, comment FROM edges WHERE from_node_id = ?
        UNION ALL
        SELECT from_node_id AS connected_id, comment FROM edges WHERE to_node_id = ?
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
    .all(videoId, videoId, videoId, videoId);

  // このエッジが最初のつながりかどうか
  const edgeCount = db
    .prepare(
      "SELECT COUNT(*) as count FROM edges WHERE from_node_id = ? OR to_node_id = ?"
    )
    .get(videoId, videoId) as any;

  const isFirst = edgeCount.count === 1 && isNewNode;

  res.status(201).json({
    isFirst,
    toNode,
    connections,
  });
});

export default router;
