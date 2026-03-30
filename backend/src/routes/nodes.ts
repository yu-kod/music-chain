import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";

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

export default router;
