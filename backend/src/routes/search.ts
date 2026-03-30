import { Router, Request, Response } from "express";
import { getNodeById } from "../db/nodes";
import { getConnections } from "../db/edges";
import { extractVideoId } from "../services/youtube";

const router = Router();

// GET /api/search?url=... - YouTube URLで曲を検索
router.get("/", async (req: Request, res: Response) => {
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

  try {
    const node = await getNodeById(videoId);
    if (!node) {
      res.json({ found: false, videoId });
      return;
    }

    const connections = await getConnections(videoId, 10);
    res.json({ found: true, node, connections });
  } catch (error) {
    console.error("Failed to search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
