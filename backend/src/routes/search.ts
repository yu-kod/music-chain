import { Router, Request, Response } from "express";
import { getNodeById } from "../db/nodes";
import { getConnections } from "../db/edges";
import { parseUrl } from "../services/music";

const router = Router();

// GET /api/search?url=... - URLで曲を検索
router.get("/", async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "url query parameter is required" });
    return;
  }

  const parsed = parseUrl(url);
  if (!parsed) {
    res.status(400).json({ error: "Invalid YouTube or Spotify URL" });
    return;
  }

  try {
    const node = await getNodeById(parsed.nodeId);
    if (!node) {
      res.json({ found: false, nodeId: parsed.nodeId });
      return;
    }

    const connections = await getConnections(parsed.nodeId, 10);
    res.json({ found: true, node, connections });
  } catch (error) {
    console.error("Failed to search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
