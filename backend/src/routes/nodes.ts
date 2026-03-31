import { Router, Request, Response } from "express";
import { getNodeById, getRandomNode, createNode } from "../db/nodes";
import { getConnections } from "../db/edges";
import { parseUrl, fetchTrackInfo } from "../services/music";

const router = Router();

// GET /api/nodes/random - ランダムなノードを1つ返す
router.get("/random", async (_req: Request, res: Response) => {
  try {
    const node = await getRandomNode();
    if (!node) {
      res.status(404).json({ error: "No nodes available" });
      return;
    }
    res.json(node);
  } catch (error) {
    console.error("Failed to get random node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/nodes/:id - ノード詳細 + 接続ノード
router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const node = await getNodeById(id);
    if (!node) {
      res.status(404).json({ error: "Node not found" });
      return;
    }
    const connections = await getConnections(id, 10);
    res.json({ node, connections });
  } catch (error) {
    console.error("Failed to get node:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/nodes - 曲を単体登録
router.post("/", async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  const parsed = parseUrl(url);
  if (!parsed) {
    res.status(400).json({ error: "Invalid YouTube or Spotify URL" });
    return;
  }

  try {
    const existing = await getNodeById(parsed.nodeId);
    if (existing) {
      res.json({ node: existing, isNew: false });
      return;
    }

    const info = await fetchTrackInfo(parsed);
    const node = await createNode({
      id: parsed.nodeId,
      title: info.title,
      thumbnail_url: info.thumbnailUrl,
      channel_name: info.channelName,
    });
    res.status(201).json({ node, isNew: true });
  } catch {
    res.status(400).json({ error: "Failed to fetch track info" });
  }
});

export default router;
