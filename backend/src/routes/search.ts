import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";
import { extractVideoId } from "../services/youtube";

const router = Router();

// GET /api/search?url=... - YouTube URLで曲を検索
router.get("/", (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "url query parameter is required" });
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    res.status(400).json({ error: "Invalid YouTube URL" });
    return;
  }

  const db = getDb();
  const node = db.prepare("SELECT * FROM nodes WHERE id = ?").get(videoId);

  if (!node) {
    res.json({ found: false, videoId });
    return;
  }

  const connections = db
    .prepare(
      `
      SELECT n.*, e.comment, cnt.connection_count
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

  res.json({ found: true, node, connections });
});

export default router;
